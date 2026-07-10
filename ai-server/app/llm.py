"""Chat-provider dispatcher — routes chat completions to the configured provider.

Three adapters share one contract (`LLMResult`): Anthropic (official SDK),
any OpenAI-compatible endpoint (OpenAI, Groq, DeepSeek, Mistral, …) over the
standard library, and Ollama. Callers pass *canonical* messages and receive
tool calls whose `arguments` are always a parsed dict.

Embeddings deliberately stay on Ollama (see rag.py) so RAG vector dimensions
remain consistent regardless of which chat model is chosen.

Canonical message shape::

    {"role": "system" | "user" | "assistant" | "tool",
     "content": str,
     "images": [{"mime": "image/jpeg", "data": "<base64>"}],   # user turns
     "tool_calls": [{"id", "name", "arguments"}],              # assistant turns
     "tool_call_id": str, "name": str}                         # tool turns

Canonical tool shape: ``{"name", "description", "input_schema"}``.
"""

from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Dict, List, Optional

from . import ollama_client
from .config import get_settings
from .llm_types import LLMResult, TokenUsage, ToolInvocation, coerce_arguments


class LLMError(RuntimeError):
    pass


# Claude models that accept `thinking: {"type": "adaptive"}` and `output_config.effort`.
# Sending either to a model that predates them is a 400, so probe by name.
_ADAPTIVE_THINKING_MODELS = ("opus-4-6", "opus-4-7", "opus-4-8", "sonnet-5", "sonnet-4-6", "fable-5", "mythos-5")
_EFFORT_MODELS = ("opus-4-5",) + _ADAPTIVE_THINKING_MODELS

# Provider name → base URL. The plugin sends a provider *name*; it never supplies
# a URL, so a tampered WordPress option cannot turn this server into an open proxy.
OPENAI_FAMILY_BASE_URLS: Dict[str, str] = {
    "openai": "https://api.openai.com/v1",
    "groq": "https://api.groq.com/openai/v1",
    "deepseek": "https://api.deepseek.com/v1",
    "mistral": "https://api.mistral.ai/v1",
    "together": "https://api.together.xyz/v1",
    "openrouter": "https://openrouter.ai/api/v1",
}
SUPPORTED_PROVIDERS = tuple(OPENAI_FAMILY_BASE_URLS) + ("anthropic", "ollama")


def _matches(model: str, needles: List[str] | tuple) -> bool:
    m = (model or "").lower()
    return any(n and n in m for n in needles)


@dataclass(frozen=True)
class ProviderConfig:
    """Which provider, model and credential serve one request."""

    name: str  # openai | groq | deepseek | … | anthropic | ollama
    family: str  # openai | anthropic | ollama  — selects the adapter
    model: str
    base_url: str = ""
    api_key: str = field(default="", repr=False)  # never printed or logged


def resolve_provider(override: Optional[Dict[str, Any]] = None) -> ProviderConfig:
    """Resolve the provider for this request.

    With no override the server's own `.env` decides (vendor-hosted mode). With
    an override the plugin decides, but only by provider *name* — the base URL
    always comes from the table above, and a missing key falls back to the
    server's own credential for that provider.
    """
    settings = get_settings()
    name = str((override or {}).get("provider") or "").strip().lower()
    model = str((override or {}).get("model") or "").strip()
    key = str((override or {}).get("api_key") or "").strip()

    if not name:
        if settings.llm_provider == "anthropic":
            return ProviderConfig("anthropic", "anthropic", settings.anthropic_model, "", settings.anthropic_api_key)
        if settings.llm_provider == "openai":
            # Honour a custom OPENAI_BASE_URL here (self-hosted / proxied endpoints).
            return ProviderConfig("openai", "openai", settings.openai_model, settings.openai_base_url, settings.openai_api_key)
        return ProviderConfig("ollama", "ollama", settings.chat_model, settings.ollama_host)

    if name == "ollama":
        return ProviderConfig("ollama", "ollama", model or settings.chat_model, settings.ollama_host)
    if name == "anthropic":
        return ProviderConfig("anthropic", "anthropic", model or settings.anthropic_model, "", key or settings.anthropic_api_key)
    if name in OPENAI_FAMILY_BASE_URLS:
        return ProviderConfig(
            name,
            "openai",
            model or settings.openai_model,
            OPENAI_FAMILY_BASE_URLS[name],
            key or settings.provider_api_keys.get(name, ""),
        )
    raise LLMError(f"Unsupported provider '{name}'. Expected one of: {', '.join(SUPPORTED_PROVIDERS)}.")


# ---------------------------------------------------------------------------
# Anthropic (official SDK, lazily imported so Groq/Ollama deploys need no dep)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=4)
def _anthropic_client(api_key: str, timeout: float):
    if not api_key:
        raise LLMError("No Anthropic API key configured (set ANTHROPIC_API_KEY, or supply one from the plugin).")
    try:
        import anthropic  # noqa: PLC0415 - optional dependency
    except ImportError as exc:
        raise LLMError("The 'anthropic' provider requires the 'anthropic' package (pip install anthropic).") from exc
    return anthropic.Anthropic(api_key=api_key, timeout=timeout)


def _anthropic_blocks(message: Dict[str, Any]) -> List[Dict[str, Any]]:
    role = message.get("role")
    text = str(message.get("content") or "").strip()
    blocks: List[Dict[str, Any]] = []
    if role == "assistant":
        if text:
            blocks.append({"type": "text", "text": text})
        for call in message.get("tool_calls") or []:
            blocks.append(
                {"type": "tool_use", "id": call["id"], "name": call["name"], "input": call.get("arguments") or {}}
            )
    else:
        for img in message.get("images") or []:
            blocks.append(
                {
                    "type": "image",
                    "source": {"type": "base64", "media_type": img.get("mime") or "image/jpeg", "data": img["data"]},
                }
            )
        if text:
            blocks.append({"type": "text", "text": text})
    return blocks


def _anthropic_messages(messages: List[Dict[str, Any]], cache_prefix_upto: int | None):
    """Split canonical messages into (system_blocks, messages, cache_index).

    `cache_index` is the index into the returned message list whose last block
    should carry the cache breakpoint, or None.
    """
    system_blocks: List[Dict[str, Any]] = []
    out: List[Dict[str, Any]] = []
    origin: List[int] = []  # highest canonical index folded into each output message
    pending_results: List[Dict[str, Any]] = []

    def flush_results() -> None:
        if pending_results:
            out.append({"role": "user", "content": list(pending_results)})
            origin.append(-1)
            pending_results.clear()

    for idx, msg in enumerate(messages):
        role = msg.get("role")
        if role == "system":
            text = str(msg.get("content") or "").strip()
            if text:
                system_blocks.append({"type": "text", "text": text})
            continue
        if role == "tool":
            pending_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": str(msg.get("tool_call_id") or ""),
                    "content": str(msg.get("content") or ""),
                }
            )
            continue

        flush_results()
        blocks = _anthropic_blocks(msg)
        if not blocks:
            continue
        # Claude rejects consecutive same-role turns — fold them together.
        if out and out[-1]["role"] == role:
            out[-1]["content"].extend(blocks)
            origin[-1] = idx
        else:
            out.append({"role": role, "content": blocks})
            origin.append(idx)

    flush_results()

    cache_index = None
    if cache_prefix_upto is not None:
        for i, canonical_idx in enumerate(origin):
            if canonical_idx != -1 and canonical_idx <= cache_prefix_upto:
                cache_index = i
    return system_blocks, out, cache_index


def _anthropic_chat(
    messages: List[Dict[str, Any]],
    cfg: ProviderConfig,
    tools: List[Dict[str, Any]] | None,
    tool_choice: str,
    max_tokens: int,
    cache_prefix_upto: int | None,
) -> LLMResult:
    settings = get_settings()
    client = _anthropic_client(cfg.api_key, float(settings.request_timeout))
    model = cfg.model

    system_blocks, msgs, cache_index = _anthropic_messages(messages, cache_prefix_upto)
    if not msgs:
        raise LLMError("Anthropic requires at least one user message.")

    # Prefix caching is a byte-exact prefix match over tools → system → messages.
    # One breakpoint on the last system block covers tools + system; a second on
    # the last few-shot turn extends it over the deterministic examples.
    if settings.prompt_cache:
        if system_blocks:
            system_blocks[-1]["cache_control"] = {"type": "ephemeral"}
        if cache_index is not None:
            msgs[cache_index]["content"][-1]["cache_control"] = {"type": "ephemeral"}

    kwargs: Dict[str, Any] = {"model": model, "max_tokens": max_tokens, "messages": msgs}
    if system_blocks:
        kwargs["system"] = system_blocks
    if tools:
        kwargs["tools"] = [
            {"name": t["name"], "description": t.get("description", ""), "input_schema": t.get("input_schema") or {}}
            for t in tools
        ]
        kwargs["tool_choice"] = {"type": tool_choice if tool_choice in ("auto", "any", "none") else "auto"}
    if settings.anthropic_thinking == "adaptive" and _matches(model, _ADAPTIVE_THINKING_MODELS):
        kwargs["thinking"] = {"type": "adaptive"}
    if settings.anthropic_effort not in ("", "off") and _matches(model, _EFFORT_MODELS):
        kwargs["output_config"] = {"effort": settings.anthropic_effort}

    # Sampling parameters (temperature/top_p/top_k) are rejected by Opus 4.7+,
    # Sonnet 5 and Fable 5 — never send them; steer with the system prompt.
    try:
        resp = client.messages.create(**kwargs)
    except Exception as exc:  # noqa: BLE001
        raise LLMError(f"Anthropic request failed: {exc}") from exc

    text_parts: List[str] = []
    calls: List[ToolInvocation] = []
    for block in resp.content or []:
        btype = getattr(block, "type", "")
        if btype == "text":
            text_parts.append(getattr(block, "text", "") or "")
        elif btype == "tool_use":
            calls.append(
                ToolInvocation(
                    id=getattr(block, "id", "") or "",
                    name=getattr(block, "name", "") or "",
                    arguments=coerce_arguments(getattr(block, "input", None)),
                )
            )

    stop = getattr(resp, "stop_reason", "end_turn") or "end_turn"
    if stop == "pause_turn":
        stop = "end_turn"

    raw_usage = getattr(resp, "usage", None)
    usage = TokenUsage(
        input_tokens=int(getattr(raw_usage, "input_tokens", 0) or 0),
        output_tokens=int(getattr(raw_usage, "output_tokens", 0) or 0),
        cache_read_tokens=int(getattr(raw_usage, "cache_read_input_tokens", 0) or 0),
        cache_write_tokens=int(getattr(raw_usage, "cache_creation_input_tokens", 0) or 0),
    )
    return LLMResult(text="".join(text_parts).strip(), tool_calls=calls, stop_reason=stop, usage=usage)


# ---------------------------------------------------------------------------
# OpenAI-compatible (stdlib urllib — no SDK, works for OpenAI/Groq/DeepSeek/…)
# ---------------------------------------------------------------------------
def _post_json(url: str, payload: Dict[str, Any], headers: Dict[str, str], timeout: int) -> Dict[str, Any]:
    """POST JSON, retrying transport failures only.

    Groq (behind Cloudflare) resets a meaningful share of connections. A reset
    means the request never produced a response, so retrying is safe; an HTTP
    error means the provider answered and must not be replayed.
    """
    data = json.dumps(payload).encode("utf-8")
    last: Exception | None = None
    for attempt in range(3):
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", "ignore")[:400]
            raise LLMError(f"Provider HTTP {exc.code}: {detail}") from exc
        except Exception as exc:  # noqa: BLE001 - transport-level; retry
            last = exc
            if attempt < 2:
                time.sleep(0.4 * (attempt + 1))
    raise LLMError(f"Provider request failed after 3 attempts: {last}")


def _openai_tool(tool: Dict[str, Any]) -> Dict[str, Any]:
    fn: Dict[str, Any] = {
        "name": tool["name"],
        "description": tool.get("description", ""),
        "parameters": tool.get("input_schema") or {"type": "object", "properties": {}},
    }
    if tool.get("strict") is not None:
        fn["strict"] = bool(tool["strict"])
    return {"type": "function", "function": fn}


def _openai_messages(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out: List[Dict[str, Any]] = []
    for msg in messages:
        role = msg.get("role") or "user"
        text = str(msg.get("content") or "")
        if role == "tool":
            out.append({"role": "tool", "tool_call_id": str(msg.get("tool_call_id") or ""), "content": text})
            continue
        calls = msg.get("tool_calls") or []
        if role == "assistant" and calls:
            out.append(
                {
                    "role": "assistant",
                    "content": text or None,
                    "tool_calls": [
                        {
                            "id": c["id"],
                            "type": "function",
                            "function": {"name": c["name"], "arguments": json.dumps(c.get("arguments") or {})},
                        }
                        for c in calls
                    ],
                }
            )
            continue
        images = msg.get("images") or []
        if images:
            content: List[Dict[str, Any]] = []
            if text:
                content.append({"type": "text", "text": text})
            for img in images:
                mime = img.get("mime") or "image/jpeg"
                content.append({"type": "image_url", "image_url": {"url": f"data:{mime};base64,{img['data']}"}})
            out.append({"role": role, "content": content})
            continue
        out.append({"role": role, "content": text})
    return out


def _openai_chat(
    messages: List[Dict[str, Any]],
    cfg: ProviderConfig,
    tools: List[Dict[str, Any]] | None,
    tool_choice: str,
    fmt: str | None,
    temperature: float,
    max_tokens: int,
) -> LLMResult:
    settings = get_settings()
    if not cfg.api_key:
        raise LLMError(f"No API key configured for provider '{cfg.name}'.")

    payload: Dict[str, Any] = {
        "model": cfg.model,
        "messages": _openai_messages(messages),
        "temperature": temperature,
        "top_p": settings.gen_top_p,
        "frequency_penalty": max(0.0, settings.gen_repeat_penalty - 1.0),
        "max_tokens": max_tokens,
    }
    if fmt == "json":
        payload["response_format"] = {"type": "json_object"}
    if tools:
        payload["tools"] = [_openai_tool(t) for t in tools]
        # Groq accepts only "auto"/"none"; never send "required" or a named tool.
        payload["tool_choice"] = "none" if tool_choice == "none" else "auto"

    headers = {
        "Authorization": f"Bearer {cfg.api_key}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        # Cloudflare (in front of Groq) 403s the default "Python-urllib" UA (code 1010).
        "User-Agent": "NexusLeadSuite/1.0 (+https://nexusleadsuite.com)",
    }
    body = _post_json(cfg.base_url + "/chat/completions", payload, headers, settings.request_timeout)

    try:
        choice = body["choices"][0]
        message = choice.get("message") or {}
    except (KeyError, IndexError, TypeError) as exc:
        raise LLMError("Provider returned an unexpected response shape.") from exc

    calls: List[ToolInvocation] = []
    for i, raw in enumerate(message.get("tool_calls") or []):
        fn = raw.get("function") or {}
        name = str(fn.get("name") or "")
        if not name:
            continue
        # OpenAI-compatible providers send `arguments` as a JSON *string*.
        calls.append(
            ToolInvocation(
                id=str(raw.get("id") or f"call_{i}"),
                name=name,
                arguments=coerce_arguments(fn.get("arguments")),
            )
        )

    finish = str(choice.get("finish_reason") or "stop")
    stop = {"tool_calls": "tool_use", "length": "max_tokens", "content_filter": "refusal"}.get(finish, "end_turn")
    if calls and stop == "end_turn":
        stop = "tool_use"

    raw_usage = body.get("usage") or {}
    details = raw_usage.get("prompt_tokens_details") or {}
    usage = TokenUsage(
        input_tokens=int(raw_usage.get("prompt_tokens") or 0),
        output_tokens=int(raw_usage.get("completion_tokens") or 0),
        cache_read_tokens=int(details.get("cached_tokens") or 0),
    )
    return LLMResult(text=str(message.get("content") or "").strip(), tool_calls=calls, stop_reason=stop, usage=usage)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def chat(
    messages: List[Dict[str, Any]],
    model: str | None = None,
    fmt: str | None = None,
    temperature: float = 0.2,
    tools: List[Dict[str, Any]] | None = None,
    tool_choice: str = "auto",
    max_tokens: int | None = None,
    cache_prefix_upto: int | None = None,
    llm: Optional[Dict[str, Any]] = None,
) -> LLMResult:
    """Route a chat completion to the resolved provider.

    ``llm`` is a per-request provider override from the plugin
    (``{provider, model, api_key}``); ``model`` alone still overrides the model.
    Provider failures are re-raised as ``OllamaError`` so the API layer's
    existing 502 mapping applies.
    """
    settings = get_settings()
    max_tokens = int(max_tokens or settings.max_tokens)
    try:
        cfg = resolve_provider(llm)
        if model:
            cfg = ProviderConfig(cfg.name, cfg.family, model, cfg.base_url, cfg.api_key)
        if cfg.family == "anthropic":
            return _anthropic_chat(messages, cfg, tools, tool_choice, max_tokens, cache_prefix_upto)
        if cfg.family == "openai":
            return _openai_chat(messages, cfg, tools, tool_choice, fmt, temperature, max_tokens)
    except LLMError as exc:
        raise ollama_client.OllamaError(str(exc)) from exc
    return ollama_client.chat(
        messages, model=cfg.model, fmt=fmt, temperature=temperature, tools=tools, max_tokens=max_tokens
    )


def active_chat_model(llm: Optional[Dict[str, Any]] = None) -> str:
    """The chat model name currently in effect (for /health)."""
    return resolve_provider(llm).model


def capabilities(llm: Optional[Dict[str, Any]] = None) -> Dict[str, bool]:
    """What the resolved provider+model can actually do.

    The plugin caches this and falls back to its legacy single-shot path when
    `tools` is false, so a model that cannot call tools degrades instead of
    erroring.
    """
    settings = get_settings()
    cfg = resolve_provider(llm)
    model = cfg.model

    if cfg.family == "anthropic":
        tools, vision, vision_tools = True, True, True
    elif cfg.family == "openai":
        tools = _matches(model, settings.tool_capable_openai)
        vision = _matches(model, settings.vision_capable_openai)
        vision_tools = tools and vision
    else:
        tools = _matches(model, settings.tool_capable_ollama)
        # Image turns route to a separate Ollama vision model, which has no tools.
        vision = bool(settings.vision_model)
        vision_tools = False

    if settings.llm_tools in ("on", "off"):
        tools = settings.llm_tools == "on"
    if settings.llm_vision in ("on", "off"):
        vision = settings.llm_vision == "on"

    return {"tools": tools, "vision": vision, "vision_tools": vision_tools and tools and vision, "streaming": False}


def has_credential(llm: Optional[Dict[str, Any]] = None) -> bool:
    cfg = resolve_provider(llm)
    return cfg.family == "ollama" or bool(cfg.api_key)
