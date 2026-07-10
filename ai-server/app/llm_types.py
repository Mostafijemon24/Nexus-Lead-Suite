"""Provider-agnostic result types for chat completions.

Every adapter (Anthropic / OpenAI-compatible / Ollama) returns an ``LLMResult``
so the callers never have to care which provider answered. Tool-call arguments
are normalised to a parsed ``dict`` at the adapter boundary — OpenAI-compatible
providers send them as a JSON *string*, Ollama sends a dict (and sometimes a
string), and Anthropic sends a dict.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from typing import Any, Dict, List

# Marker placed in `arguments` when the provider sent JSON we could not parse.
# The caller turns this into a repair turn rather than executing the tool.
PARSE_ERROR_KEY = "__parse_error__"


@dataclass
class TokenUsage:
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0

    def as_dict(self) -> Dict[str, int]:
        return {
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "cache_read_tokens": self.cache_read_tokens,
            "cache_write_tokens": self.cache_write_tokens,
        }


@dataclass
class ToolInvocation:
    id: str = ""
    name: str = ""
    arguments: Dict[str, Any] = field(default_factory=dict)

    def as_dict(self) -> Dict[str, Any]:
        return {"id": self.id, "name": self.name, "arguments": self.arguments}


@dataclass
class LLMResult:
    text: str = ""
    tool_calls: List[ToolInvocation] = field(default_factory=list)
    # end_turn | tool_use | max_tokens | refusal
    stop_reason: str = "end_turn"
    usage: TokenUsage = field(default_factory=TokenUsage)


def coerce_arguments(raw: Any) -> Dict[str, Any]:
    """Normalise provider tool-call arguments into a parsed dict.

    Groq/OpenAI send `function.arguments` as a JSON string; casting it straight
    to a mapping silently yields an empty argument set, so every tool would run
    with defaults. Parse it, and surface malformed JSON instead of hiding it.
    """
    if isinstance(raw, dict):
        return raw
    if raw is None:
        return {}
    if isinstance(raw, (bytes, bytearray)):
        raw = raw.decode("utf-8", "replace")
    if isinstance(raw, str):
        text = raw.strip()
        if not text:
            return {}
        try:
            parsed = json.loads(text)
        except (ValueError, TypeError):
            return {PARSE_ERROR_KEY: text[:500]}
        return parsed if isinstance(parsed, dict) else {PARSE_ERROR_KEY: text[:500]}
    return {}
