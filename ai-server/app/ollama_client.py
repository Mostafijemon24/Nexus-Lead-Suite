"""Thin wrapper around the Ollama API (embeddings + chat + health).

Uses the official `ollama` python client. Responses differ slightly across
client versions (dict vs. object), so every accessor is normalised defensively.
Chat returns an `LLMResult` so callers never branch on the provider.
"""

from __future__ import annotations

from typing import Any, Dict, List

import ollama

from .config import get_settings
from .llm_types import LLMResult, TokenUsage, ToolInvocation, coerce_arguments


class OllamaError(RuntimeError):
    pass


def _client() -> "ollama.Client":
    settings = get_settings()
    return ollama.Client(host=settings.ollama_host, timeout=settings.request_timeout)


def _get(obj, key: str, default=None):
    """Read `key` from a dict-like or attribute-like Ollama response."""
    if obj is None:
        return default
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def embed(text: str) -> List[float]:
    """Return the embedding vector for a single string."""
    settings = get_settings()
    text = (text or "").strip()
    if not text:
        return []
    try:
        resp = _client().embeddings(model=settings.embed_model, prompt=text)
    except Exception as exc:  # noqa: BLE001 - surface a clean error to the API layer
        raise OllamaError(f"Embedding request failed: {exc}") from exc

    vector = _get(resp, "embedding") or []
    if not vector:
        raise OllamaError("Ollama returned an empty embedding.")
    return list(vector)


def to_ollama_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Translate canonical messages into Ollama's wire shape.

    Canonical images are `{"mime": …, "data": <b64>}`; Ollama wants bare base64.
    """
    out: List[Dict[str, Any]] = []
    for m in messages:
        role = m.get("role") or "user"
        msg: Dict[str, Any] = {"role": role, "content": str(m.get("content") or "")}
        images = m.get("images") or []
        if images:
            msg["images"] = [img["data"] for img in images if img.get("data")]
        if role == "tool":
            msg["role"] = "tool"
            if m.get("name"):
                msg["name"] = m["name"]
        calls = m.get("tool_calls") or []
        if calls:
            msg["tool_calls"] = [
                {"function": {"name": c["name"], "arguments": c.get("arguments") or {}}} for c in calls
            ]
        out.append(msg)
    return out


def chat(
    messages: List[Dict[str, Any]],
    model: str | None = None,
    fmt: str | None = None,
    temperature: float = 0.2,
    tools: List[Dict[str, Any]] | None = None,
    max_tokens: int | None = None,
) -> LLMResult:
    """Run a chat completion.

    ``fmt='json'`` asks Ollama to constrain the output to valid JSON (used by
    the business-analysis endpoint). ``tools`` uses Ollama's native tool
    calling — support varies by model, so callers gate on /health.capabilities.
    """
    settings = get_settings()
    options: Dict[str, object] = {
        "temperature": temperature,
        "top_p": settings.gen_top_p,
        "top_k": settings.gen_top_k,
        "repeat_penalty": settings.gen_repeat_penalty,
    }
    if max_tokens:
        options["num_predict"] = int(max_tokens)

    kwargs: Dict[str, object] = {
        "model": model or settings.chat_model,
        "messages": to_ollama_messages(messages),
        "options": options,
    }
    if fmt:
        kwargs["format"] = fmt
    if tools:
        kwargs["tools"] = [
            {
                "type": "function",
                "function": {
                    "name": t["name"],
                    "description": t.get("description", ""),
                    "parameters": t.get("input_schema") or {"type": "object", "properties": {}},
                },
            }
            for t in tools
        ]

    try:
        resp = _client().chat(**kwargs)
    except Exception as exc:  # noqa: BLE001
        raise OllamaError(f"Chat request failed: {exc}") from exc

    message = _get(resp, "message") or {}
    text = str(_get(message, "content") or "").strip()

    calls: List[ToolInvocation] = []
    for i, raw in enumerate(_get(message, "tool_calls") or []):
        fn = _get(raw, "function") or {}
        name = str(_get(fn, "name") or "")
        if not name:
            continue
        # Ollama has no per-call id; synthesise one so tool results can pair up.
        calls.append(
            ToolInvocation(
                id=str(_get(raw, "id") or f"call_{i}"),
                name=name,
                arguments=coerce_arguments(_get(fn, "arguments")),
            )
        )

    usage = TokenUsage(
        input_tokens=int(_get(resp, "prompt_eval_count") or 0),
        output_tokens=int(_get(resp, "eval_count") or 0),
    )
    stop_reason = "tool_use" if calls else "end_turn"
    return LLMResult(text=text, tool_calls=calls, stop_reason=stop_reason, usage=usage)


def health() -> Dict[str, object]:
    """Report whether Ollama is reachable and which models are installed."""
    try:
        resp = _client().list()
    except Exception:  # noqa: BLE001
        return {"ollama": False, "models": []}

    raw_models = _get(resp, "models") or []
    names: List[str] = []
    for m in raw_models:
        name = _get(m, "model") or _get(m, "name")
        if name:
            names.append(str(name))
    return {"ollama": True, "models": names}
