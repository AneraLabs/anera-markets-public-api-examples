"""
Example: Token factory analytics using revenue and token utilisation endpoints.

Demonstrates how to fetch token factory revenue rankings and token utilisation
using the standard anera.markets API endpoints.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_factory_revenue(timestamp: str | None = None) -> dict[str, Any]:
    """Get revenue data for token factories."""
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/revenue/token-factory", params=params)


def get_factory_token_utilisation(timestamp: str | None = None) -> dict[str, Any]:
    """Get token utilisation for token factories."""
    params: dict[str, Any] = {"token_type": "total"}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/token-utilisation/token-factory", params=params)


def main() -> None:
    print("Token Factory Analytics")
    print("=" * 80)

    # -- Revenue ----------------------------------------------------------------
    print("\nFactory Revenue (latest):")
    print("-" * 40)
    try:
        data = get_factory_revenue()
        timestamp = data.get("timestamp", "Unknown")
        items = data.get("items") or []
        print(f"  As of: {timestamp}")
        print(f"  Factories: {len(items)}")
        for i, item in enumerate(sorted(items, key=lambda x: x.get("revenue_usd", 0), reverse=True)[:5], 1):
            name = item.get("resource_id", "Unknown")
            rev = item.get("revenue_usd", 0)
            print(f"  {i}. {name}: ${rev:,.2f}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Token utilisation ------------------------------------------------------
    print("\nFactory Token Utilisation (latest):")
    print("-" * 40)
    try:
        data = get_factory_token_utilisation()
        timestamp = data.get("timestamp", "Unknown")
        items = data.get("items") or []
        print(f"  As of: {timestamp}")
        print(f"  Factories: {len(items)}")
        for i, item in enumerate(items[:5], 1):
            name = item.get("resource_name") or item.get("resource_id", "Unknown")
            count = item.get("token_count", 0)
            print(f"  {i}. {name}: {count:,} tokens")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
