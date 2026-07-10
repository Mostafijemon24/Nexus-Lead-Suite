"""Business auto-adaptation: analyze a site's content and propose a tailored
chatbot persona + suggested questions + quick actions.

The plugin sends a content sample (site name, page titles + excerpts); the LLM
returns structured JSON we validate before handing back. Purely additive — the
existing /chat + /ingest flows are untouched.
"""

from __future__ import annotations

import json
import re
from typing import Dict, List

from . import llm

# Must stay in sync with the plugin icon set
# (Shortcodes::livechat_ai_icon_set / RestApi::ai_allowed_icon_keys).
ALLOWED_ICONS = [
    "stethoscope", "dollar", "shield", "pin", "directions", "calendar",
    "phone", "mail", "chat", "question", "clock", "info", "heart", "user",
]

_SYSTEM = (
    "You are a business analyst configuring a website's AI support chatbot. "
    "Read the website content and respond with ONLY a JSON object (no prose, no markdown) with these keys:\n"
    '- "business_type": short category string, e.g. "Medical clinic", "Law firm", "E-commerce store", "Restaurant", "Agency", "Education".\n'
    '- "summary": one plain-string sentence describing the business.\n'
    '- "questions": array of 4 to 6 objects {"label","icon"} — the most useful things a visitor would ask THIS business. '
    "Labels are short plain strings (max ~48 chars).\n"
    '- "actions": array of up to 3 objects {"label","icon"} — quick actions like "Book a visit", "Call us", "Get directions" that fit this business.\n'
    "Every icon MUST be one of: " + ", ".join(ALLOWED_ICONS) + ".\n"
    "All values are plain strings. Return valid JSON only."
)


def _build_system_prompt(site_name: str, business_type: str, summary: str) -> str:
    """Deterministic, always-clean grounding persona built from the model's
    business_type + summary (more reliable than asking the model to write it)."""
    who = site_name.strip() or "our company"
    opening = f"You are the AI Support Specialist for {who}"
    if business_type:
        opening += f", a {business_type.lower()}"
    opening += f'. Always speak on behalf of {who} using "we" and "our" — you represent this business, not a generic tool.'

    parts = [opening]
    if summary:
        parts.append(summary if summary.rstrip().endswith((".", "!", "?")) else summary.rstrip() + ".")
    parts.append(
        f'When a visitor greets you (e.g. "hi", "hello") or asks who you are or your name, introduce yourself as '
        f'"{who} Support Specialist" and briefly offer to help; never call yourself a generic AI/chatbot and never '
        "mention the platform or CMS the website is built on."
    )
    parts.append(
        "Answer using the provided context about our services, products, pricing, booking, appointments, "
        "consultations, location, hours and contact. If a visitor asks what we do or what we offer, summarise our "
        "actual services from the context — never say we do not provide services."
    )
    parts.append(
        "If a specific detail is genuinely not in the context, briefly say you don't have that particular detail and "
        "offer to connect a human or take the visitor's contact details."
    )
    parts.append(
        "Match the answer length to the question: a simple question gets 1-2 short sentences; a normal question gets "
        "one concise paragraph; only a genuinely complex question gets a short structured answer with bullet points. "
        "Use bullet points for any list. Never write long paragraphs, repeat yourself, or add information the visitor "
        "did not ask for. Be specific and factual: state only services, prices and details actually present in the "
        "context, and never pad with marketing filler or invented offerings. Stay warm and professional, and always "
        "reply in the same language the visitor used."
    )
    return " ".join(parts)


def _coerce_json(raw: str) -> Dict:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except Exception:  # noqa: BLE001
        # Best-effort: pull the first {...} block out of any surrounding text.
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:  # noqa: BLE001
                return {}
    return {}


def _as_text(value: object) -> str:
    """Coerce a value to plain text — some models wrap strings in {type,value}."""
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for key in ("value", "text", "content", "label", "prompt"):
            inner = value.get(key)
            if isinstance(inner, str) and inner.strip():
                return inner.strip()
        parts = [v.strip() for v in value.values() if isinstance(v, str) and v.strip()]
        return " ".join(parts).strip()
    if isinstance(value, list):
        return " ".join(_as_text(v) for v in value).strip()
    return str(value).strip()


def _clean_icon(value: object) -> str:
    icon = str(value or "").strip().lower()
    return icon if icon in ALLOWED_ICONS else ""


def _clean_list(raw: object, max_items: int, max_label: int) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    if not isinstance(raw, list):
        return out
    for entry in raw:
        if not isinstance(entry, dict):
            continue
        label = _as_text(entry.get("label"))
        if not label:
            continue
        out.append({"label": label[:max_label], "icon": _clean_icon(entry.get("icon"))})
        if len(out) >= max_items:
            break
    return out


def analyze_business(
    site_name: str,
    content_sample: str,
    chat_model: str | None = None,
    llm_override: Dict[str, object] | None = None,
) -> Dict[str, object]:
    """Ask the LLM to profile the business; return a validated suggestion dict."""
    user = (
        f"Website name: {site_name or '(unknown)'}\n\n"
        f"Website content:\n{(content_sample or '').strip()[:38000] or '(no content provided)'}"
    )
    messages = [
        {"role": "system", "content": _SYSTEM},
        {"role": "user", "content": user},
    ]

    raw = llm.chat(messages, model=chat_model, fmt="json", temperature=0.3, llm=llm_override)
    data = _coerce_json(raw.text)

    business_type = _as_text(data.get("business_type"))[:80]
    summary = _as_text(data.get("summary"))[:300]

    return {
        "business_type": business_type,
        "summary": summary,
        "system_prompt": _build_system_prompt(site_name, business_type, summary)[:1500],
        "questions": _clean_list(data.get("questions"), max_items=6, max_label=120),
        "actions": _clean_list(data.get("actions"), max_items=3, max_label=60),
    }
