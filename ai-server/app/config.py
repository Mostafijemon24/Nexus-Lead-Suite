"""Runtime configuration, read from environment variables / .env.

Everything is overridable from the environment so the same image runs in dev
(localhost Ollama) and prod (systemd + nginx) without code changes.
"""

from __future__ import annotations

import os
from functools import lru_cache

try:
    # Optional: load a local .env when present. Never required in production
    # (systemd/docker inject the env directly).
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv is a convenience only
    pass


def _int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, str(default)))
    except (TypeError, ValueError):
        return default


def _bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ("1", "true", "yes", "on")


def _csv(name: str, default: str) -> list[str]:
    return [p.strip().lower() for p in os.getenv(name, default).split(",") if p.strip()]


class Settings:
    """Immutable-ish settings holder (built once, cached)."""

    def __init__(self) -> None:
        # --- Auth -------------------------------------------------------
        # Shared secret the WordPress plugin sends as `Authorization: Bearer`.
        self.api_key: str = os.getenv("API_KEY", "").strip()

        # --- LLM provider (chat only; embeddings always via Ollama) -----
        # 'ollama' (default), 'openai' (OpenAI-compatible: OpenAI, Groq,
        # DeepSeek, Mistral, Together, … — set base_url + key), or 'anthropic'.
        self.llm_provider: str = os.getenv("LLM_PROVIDER", "ollama").strip().lower() or "ollama"
        self.openai_api_key: str = os.getenv("OPENAI_API_KEY", "").strip()
        self.openai_base_url: str = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        self.openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

        # Per-provider fallback keys, used when the plugin sends a provider
        # override without a key of its own (vendor-hosted / SaaS mode).
        self.provider_api_keys: dict[str, str] = {
            p: os.getenv(f"{p.upper()}_API_KEY", "").strip()
            for p in ("openai", "groq", "deepseek", "mistral", "together", "openrouter")
        }

        # --- Anthropic (official SDK; lazily imported) -------------------
        self.anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "").strip()
        self.anthropic_model: str = os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8").strip()
        # 'adaptive' lets Claude decide when to think (it skips thinking on
        # trivial turns); 'off' omits the parameter entirely. Ignored on models
        # that predate adaptive thinking.
        self.anthropic_thinking: str = os.getenv("ANTHROPIC_THINKING", "adaptive").strip().lower()
        # low|medium|high|xhigh|max, or 'off' to omit. 'low' keeps a support
        # widget snappy; the parameter errors on models without effort support,
        # so it is only sent for models known to accept it.
        self.anthropic_effort: str = os.getenv("ANTHROPIC_EFFORT", "low").strip().lower()

        # Cap on generated tokens per turn. Support answers are short, but
        # adaptive thinking also draws from this budget — don't set it tiny.
        self.max_tokens: int = _int("LLM_MAX_TOKENS", 4096)
        # Mark the stable prompt prefix (tools + system + few-shot) cacheable.
        # Anthropic only; OpenAI-compatible providers cache automatically.
        self.prompt_cache: bool = _bool("PROMPT_CACHE", True)

        # --- Ollama -----------------------------------------------------
        self.ollama_host: str = os.getenv("OLLAMA_HOST", "http://localhost:11434").rstrip("/")
        self.embed_model: str = os.getenv("EMBED_MODEL", "nomic-embed-text")
        self.chat_model: str = os.getenv("CHAT_MODEL", "llama3.1:8b")
        # Vision model used when the visitor attaches an image/screenshot.
        self.vision_model: str = os.getenv("VISION_MODEL", "llava")
        self.request_timeout: int = _int("OLLAMA_TIMEOUT", 120)

        # --- Generation params (tuned for stable, to-the-point support replies) ---
        self.gen_temperature: float = _float("LLM_TEMPERATURE", 0.2)
        self.gen_top_p: float = _float("LLM_TOP_P", 0.85)
        self.gen_top_k: int = _int("LLM_TOP_K", 40)
        self.gen_repeat_penalty: float = _float("LLM_REPEAT_PENALTY", 1.1)

        # --- Vector store (ChromaDB, embedded/persistent) ---------------
        self.chroma_dir: str = os.getenv("CHROMA_DIR", os.path.join(os.getcwd(), "chroma_data"))

        # --- RAG tuning -------------------------------------------------
        self.top_k: int = _int("TOP_K", 4)
        self.chunk_size: int = _int("CHUNK_SIZE", 800)
        self.chunk_overlap: int = _int("CHUNK_OVERLAP", 100)
        # Hard cap on chunks embedded per /ingest call (safety valve).
        self.max_chunks_per_request: int = _int("MAX_CHUNKS_PER_REQUEST", 5000)

        # --- Capability detection (surfaced on /health) ------------------
        # 'auto' probes the configured model name; 'on'/'off' force the answer.
        # The plugin reads /health.capabilities and falls back to its legacy
        # single-shot path whenever tool calling is unavailable.
        self.llm_tools: str = os.getenv("LLM_TOOLS", "auto").strip().lower()
        self.llm_vision: str = os.getenv("LLM_VISION", "auto").strip().lower()
        # Substrings of OpenAI-compatible model ids known to support tools.
        self.tool_capable_openai: list[str] = _csv(
            "TOOL_CAPABLE_OPENAI",
            "gpt-4,gpt-5,gpt-oss,o3,o4,llama-3.1,llama-3.3,llama-4,qwen,mixtral,mistral-large,deepseek,kimi",
        )
        # Ollama tool support is model- and build-dependent; off unless asked.
        self.tool_capable_ollama: list[str] = _csv("TOOL_CAPABLE_OLLAMA", "")
        # OpenAI-compatible models that accept image_url content blocks.
        self.vision_capable_openai: list[str] = _csv(
            "VISION_CAPABLE_OPENAI", "gpt-4o,gpt-4.1,gpt-5,llama-4,pixtral,qwen2.5-vl,qwen3-vl"
        )

        # --- HTTP -------------------------------------------------------
        # Comma-separated list of allowed CORS origins. Empty = none (the
        # browser never calls us directly; the WP plugin proxies server-side).
        self.cors_origins: list[str] = [
            o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()
        ]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
