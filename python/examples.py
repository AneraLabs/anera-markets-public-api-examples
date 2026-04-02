"""
Example calls to the anera.markets public HTTP API.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.example.com
"""

from __future__ import annotations

import json
import os
from typing import Any, Literal

import requests

ResourceType = Literal["token-factory", "model", "company"]
TokenType = Literal["total", "prompt", "completion", "reasoning"]


def _base_url() -> str:
    base = os.environ.get("ANERA_MARKETS_API_BASE_URL", "").strip().rstrip("/")
    if not base:
        raise SystemExit(
            "Set ANERA_MARKETS_API_BASE_URL to the API origin, e.g. "
            "export ANERA_MARKETS_API_BASE_URL=https://api.example.com"
        )
    return base


def _get(path: str, params: dict[str, Any] | None = None) -> Any:
    url = f"{_base_url()}{path}"
    r = requests.get(url, params=params or {}, timeout=60)
    r.raise_for_status()
    return r.json()


def get_models() -> list[dict[str, Any]]:
    return _get("/api/v1/public/models")


def get_token_factories() -> list[dict[str, Any]]:
    return _get("/api/v1/public/token-factories")


def get_companies() -> list[dict[str, Any]]:
    return _get("/api/v1/public/companies")


def get_revenue(
    resource_type: ResourceType,
    *,
    timestamp: str | None = None,
    resource_id: str | None = None,
) -> dict[str, Any]:
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    if resource_id is not None:
        params["resource_id"] = resource_id
    return _get(f"/api/v1/public/revenue/{resource_type}", params=params)


def get_token_utilisation(
    resource_type: ResourceType,
    *,
    timestamp: str | None = None,
    resource_id: str | None = None,
    token_type: TokenType = "total",
) -> dict[str, Any]:
    params: dict[str, Any] = {"token_type": token_type}
    if timestamp is not None:
        params["timestamp"] = timestamp
    if resource_id is not None:
        params["resource_id"] = resource_id
    return _get(f"/api/v1/public/token-utilisation/{resource_type}", params=params)


def main() -> None:
    print("Models (first 3):")
    models = get_models()
    print(json.dumps(models[:3], indent=2))

    print("\nToken factories (first 3):")
    factories = get_token_factories()
    print(json.dumps(factories[:3], indent=2))

    print("\nCompanies (first 3):")
    companies = get_companies()
    print(json.dumps(companies[:3], indent=2))

    print("\nRevenue by model (latest day, sample):")
    revenue = get_revenue("model")
    print(json.dumps({k: revenue[k] for k in ("resource_type", "timestamp")}, indent=2))
    items = revenue.get("items") or []
    print(json.dumps(items[:5], indent=2))

    print("\nToken utilisation by company (total, latest day, sample):")
    util = get_token_utilisation("company", token_type="total")
    print(json.dumps({k: util[k] for k in ("resource_type", "timestamp", "token_type")}, indent=2))
    uitems = util.get("items") or []
    print(json.dumps(uitems[:5], indent=2))


if __name__ == "__main__":
    main()
