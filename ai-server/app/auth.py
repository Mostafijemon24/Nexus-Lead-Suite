"""Bearer-token auth dependency.

The WordPress plugin stores the same secret (encrypted at rest) and sends it as
`Authorization: Bearer <API_KEY>` on every request. We compare in constant time.
"""

from __future__ import annotations

import secrets

from fastapi import Header, HTTPException, status

from .config import get_settings


async def require_api_key(authorization: str = Header(default="")) -> None:
    settings = get_settings()

    # If the operator forgot to set an API key, fail closed rather than open.
    if not settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Server API_KEY is not configured.",
        )

    prefix = "Bearer "
    token = authorization[len(prefix):] if authorization.startswith(prefix) else ""

    if not token or not secrets.compare_digest(token, settings.api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )
