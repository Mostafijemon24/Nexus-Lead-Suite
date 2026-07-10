"""FastAPI application — the RAG service the WordPress plugin talks to.

All data endpoints require a Bearer API key. The browser never calls this
service directly; the WP plugin proxies requests server-side.
"""

from __future__ import annotations

import logging
import time

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import analyze as analyze_mod
from . import llm, ollama_client, rag
from .auth import require_api_key
from .config import get_settings
from .models import (
    AnalyzeRequest,
    AnalyzeResponse,
    Capabilities,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    IngestRequest,
    IngestResponse,
    ProviderTestRequest,
    ProviderTestResponse,
    ResetRequest,
    ResetResponse,
    ToolCall,
    Usage,
)

# Shown when the provider's safety classifiers decline a turn (Claude 4.5+).
REFUSAL_MESSAGE = "I'm not able to help with that here. Would you like me to connect you with our team?"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexus-ai")

app = FastAPI(title="Nexus AI Server", version="1.0.0")

_settings = get_settings()
if _settings.cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=_settings.cors_origins,
        allow_methods=["GET", "POST"],
        allow_headers=["Authorization", "Content-Type"],
    )


@app.get("/")
def root() -> dict:
    return {"service": "nexus-ai-server", "version": "1.0.0"}


@app.get("/health", response_model=HealthResponse)
def health(
    _: None = Depends(require_api_key),
    provider: str = Query("", description="Report on this provider instead of the server default."),
    model: str = Query("", description="Report on this model instead of the server default."),
) -> HealthResponse:
    """Report reachability and what the resolved provider+model can do.

    Pass `provider`/`model` to ask about the pair the plugin has configured,
    without sending a key — that answers "will tool calling work?" before any
    visitor chats.
    """
    settings = get_settings()
    info = ollama_client.health()
    override = {"provider": provider, "model": model} if (provider or model) else None
    try:
        cfg = llm.resolve_provider(override)
        caps = llm.capabilities(override)
        has_cred = llm.has_credential(override)
    except llm.LLMError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return HealthResponse(
        ok=True,
        ollama=bool(info.get("ollama")),
        provider=cfg.name,
        embed_model=settings.embed_model,
        chat_model=cfg.model,
        models=list(info.get("models") or []),
        collections=rag.count_collections(),
        capabilities=Capabilities(**caps),
        has_credential=has_cred,
        supported_providers=list(llm.SUPPORTED_PROVIDERS),
    )


@app.post("/provider/test", response_model=ProviderTestResponse)
def provider_test(req: ProviderTestRequest, _: None = Depends(require_api_key)) -> ProviderTestResponse:
    """Prove the provider credential works with one tiny real completion.

    Never echo the key back, and never log it — only the provider name, the model
    and the upstream error text.
    """
    override = req.llm.model_dump() if req.llm else None
    try:
        cfg = llm.resolve_provider(override)
    except llm.LLMError as exc:
        return ProviderTestResponse(ok=False, error=str(exc))

    started = time.monotonic()
    try:
        llm.chat([{"role": "user", "content": "ping"}], max_tokens=8, llm=override)
    except ollama_client.OllamaError as exc:
        return ProviderTestResponse(ok=False, provider=cfg.name, model=cfg.model, error=str(exc))
    except Exception as exc:  # noqa: BLE001
        logger.exception("provider test failed for %s/%s", cfg.name, cfg.model)
        return ProviderTestResponse(ok=False, provider=cfg.name, model=cfg.model, error=f"Provider test failed: {exc}")

    return ProviderTestResponse(
        ok=True,
        provider=cfg.name,
        model=cfg.model,
        capabilities=Capabilities(**llm.capabilities(override)),
        latency_ms=int((time.monotonic() - started) * 1000),
    )


@app.post("/ingest", response_model=IngestResponse)
def ingest(req: IngestRequest, _: None = Depends(require_api_key)) -> IngestResponse:
    try:
        result = rag.ingest(req.site_id, req.documents, reset=req.reset)
    except ollama_client.OllamaError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("ingest failed")
        raise HTTPException(status_code=500, detail=f"Ingest failed: {exc}") from exc
    return IngestResponse(ok=True, **result)


@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, _: None = Depends(require_api_key)) -> ChatResponse:
    if not (req.message or "").strip() and not (req.image or "").strip():
        raise HTTPException(status_code=422, detail="Provide a message or an image.")
    try:
        result, sources = rag.query(
            site_id=req.site_id,
            message=req.message,
            history=req.history,
            system_prompt=req.system_prompt,
            max_chunks=req.max_chunks,
            chat_model=req.chat_model,
            image=req.image,
            vision_model=req.vision_model,
            examples=req.examples,
            session_context=req.session_context,
            tools=[t.model_dump() for t in req.tools],
            tool_choice=req.tool_choice,
            max_tokens=req.max_tokens,
            llm_override=req.llm.model_dump() if req.llm else None,
        )
    except ollama_client.OllamaError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("chat failed")
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}") from exc

    # Low confidence = retrieval found nothing relevant (empty, or best score weak).
    top_score = max((s.score for s in sources), default=0.0)
    low_confidence = (not sources) or (top_score < 0.4)

    answer = result.text
    if result.stop_reason == "refusal" and not answer:
        answer = REFUSAL_MESSAGE

    return ChatResponse(
        ok=True,
        answer=answer,
        sources=sources,
        low_confidence=low_confidence,
        stop_reason=result.stop_reason,
        tool_calls=[ToolCall(**c.as_dict()) for c in result.tool_calls],
        usage=Usage(**result.usage.as_dict()),
    )


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest, _: None = Depends(require_api_key)) -> AnalyzeResponse:
    try:
        result = analyze_mod.analyze_business(
            site_name=req.site_name,
            content_sample=req.content_sample,
            chat_model=req.chat_model,
            llm_override=req.llm.model_dump() if req.llm else None,
        )
    except ollama_client.OllamaError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("analyze failed")
        raise HTTPException(status_code=500, detail=f"Analyze failed: {exc}") from exc
    return AnalyzeResponse(ok=True, **result)


@app.post("/reset", response_model=ResetResponse)
def reset(req: ResetRequest, _: None = Depends(require_api_key)) -> ResetResponse:
    deleted = rag.reset(req.site_id)
    return ResetResponse(ok=True, deleted=deleted)
