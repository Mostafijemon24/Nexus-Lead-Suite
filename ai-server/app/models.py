"""Pydantic request/response schemas — the plugin ↔ VPS contract."""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Ingest
# ---------------------------------------------------------------------------
class Document(BaseModel):
    id: str = Field(..., description="Stable unique id, e.g. 'post-42' or 'url-<hash>'.")
    source_type: str = Field("post", description="post | page | url | qa")
    source_ref: str = Field("", description="Original ref (post id, URL, etc.).")
    title: str = ""
    url: str = ""
    text: str = ""


class IngestRequest(BaseModel):
    site_id: str = Field(..., min_length=3, max_length=64)
    reset: bool = Field(False, description="Drop the collection before adding (first batch).")
    documents: List[Document] = Field(default_factory=list)


class IngestResponse(BaseModel):
    ok: bool = True
    ingested_docs: int = 0
    chunks: int = 0
    total_chunks: int = 0


# ---------------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------------
class ChatMessage(BaseModel):
    role: str = Field(..., description="user | assistant")
    content: str = ""


class LLMOverride(BaseModel):
    """Per-request provider override sent by the plugin.

    Only the provider *name* is accepted — the base URL is looked up server-side,
    so a tampered WordPress option cannot point this server at an arbitrary host.
    An empty `api_key` falls back to the server's own credential for that provider.
    """

    provider: str = Field("", max_length=32)
    model: str = Field("", max_length=128)
    api_key: str = Field("", max_length=512)


class ToolSpec(BaseModel):
    """A tool the model may call. WordPress owns the definition and execution.

    Send tools in a stable order — on OpenAI the tool list is part of the cached
    prompt prefix, so re-ordering them silently discards the cache.
    """

    name: str = Field(..., min_length=1, max_length=64)
    description: str = ""
    input_schema: Dict[str, Any] = Field(default_factory=dict)
    # OpenAI strict function schemas: guarantees the arguments validate.
    strict: Optional[bool] = None


class ToolCall(BaseModel):
    id: str = ""
    name: str = ""
    # Always a parsed object on our wire — adapters normalise Groq's JSON string.
    arguments: Dict[str, Any] = Field(default_factory=dict)


class Usage(BaseModel):
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0


class ChatRequest(BaseModel):
    site_id: str = Field(..., min_length=3, max_length=64)
    # With an image attached the text may be empty (e.g. "what's wrong here?").
    message: str = Field("", max_length=4000)
    history: List[ChatMessage] = Field(default_factory=list)
    system_prompt: str = ""
    max_chunks: Optional[int] = None
    chat_model: Optional[str] = None
    # Optional base64 image (raw or data: URI) — routes the turn to a vision model.
    image: Optional[str] = Field(None, max_length=15_000_000)
    vision_model: Optional[str] = None
    # Optional business-specific few-shot examples (alternating user/assistant).
    examples: List[ChatMessage] = Field(default_factory=list)
    # Per-request facts (today's date, visitor timezone, operator online…). These
    # ride on the final user turn, never in `system_prompt` — anything that varies
    # per request or per visitor would invalidate the cached prompt prefix.
    session_context: str = Field("", max_length=2000)
    # Tool calling. The server never executes a tool — it only reports the call.
    tools: List[ToolSpec] = Field(default_factory=list)
    tool_choice: str = Field("auto", pattern="^(auto|any|none)$")
    max_tokens: Optional[int] = None
    llm: Optional[LLMOverride] = None


class Source(BaseModel):
    title: str = ""
    url: str = ""
    score: float = 0.0


class ChatResponse(BaseModel):
    ok: bool = True
    answer: str = ""
    sources: List[Source] = Field(default_factory=list)
    # True when retrieval found little/no relevant context — a good moment to
    # offer a human handoff / collect the visitor's contact details.
    low_confidence: bool = False
    # end_turn | tool_use | max_tokens | refusal
    stop_reason: str = "end_turn"
    tool_calls: List[ToolCall] = Field(default_factory=list)
    usage: Usage = Field(default_factory=Usage)


# ---------------------------------------------------------------------------
# Analyze (business auto-adaptation)
# ---------------------------------------------------------------------------
class AnalyzeRequest(BaseModel):
    site_id: str = Field(..., min_length=3, max_length=64)
    site_name: str = ""
    content_sample: str = Field("", max_length=40_000)
    chat_model: Optional[str] = None
    llm: Optional[LLMOverride] = None


class SuggestedQuestion(BaseModel):
    label: str = ""
    icon: str = ""


class SuggestedAction(BaseModel):
    label: str = ""
    icon: str = ""


class AnalyzeResponse(BaseModel):
    ok: bool = True
    business_type: str = ""
    summary: str = ""
    system_prompt: str = ""
    questions: List[SuggestedQuestion] = Field(default_factory=list)
    actions: List[SuggestedAction] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Reset / Health
# ---------------------------------------------------------------------------
class ResetRequest(BaseModel):
    site_id: str = Field(..., min_length=3, max_length=64)


class ResetResponse(BaseModel):
    ok: bool = True
    deleted: bool = False


class Capabilities(BaseModel):
    """What the configured provider+model supports. The plugin degrades on false."""

    tools: bool = False
    vision: bool = False
    # True only when one model handles an image *and* tool calls in a single request.
    vision_tools: bool = False
    streaming: bool = False


class HealthResponse(BaseModel):
    ok: bool = True
    ollama: bool = False
    provider: str = "ollama"
    embed_model: str = ""
    chat_model: str = ""
    models: List[str] = Field(default_factory=list)
    collections: int = 0
    capabilities: Capabilities = Field(default_factory=Capabilities)
    # False when the resolved provider has no usable credential.
    has_credential: bool = False
    supported_providers: List[str] = Field(default_factory=list)


class ProviderTestRequest(BaseModel):
    llm: Optional[LLMOverride] = None


class ProviderTestResponse(BaseModel):
    ok: bool = True
    provider: str = ""
    model: str = ""
    capabilities: Capabilities = Field(default_factory=Capabilities)
    latency_ms: int = 0
    error: str = ""
