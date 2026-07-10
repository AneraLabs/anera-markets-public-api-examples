"""Shared HTTP helpers for anera.markets API examples."""

from __future__ import annotations

import os
from typing import Any

import requests


def base_url() -> str:
    """Return the API base URL from env var or default."""
    base = os.environ.get("ANERA_MARKETS_API_BASE_URL", "https://api.anera.markets").strip().rstrip("/")
    return base


def get_json(
    path: str,
    params: dict[str, Any] | None = None,
    headers: dict[str, str] | None = None,
) -> Any:
    """GET request returning parsed JSON."""
    url = f"{base_url()}{path}"
    r = requests.get(url, params=params or {}, headers=headers or {}, timeout=60)
    r.raise_for_status()
    return r.json()
