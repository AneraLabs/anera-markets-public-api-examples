"""
Example: Model family analytics using revenue endpoints.

Demonstrates how to fetch model revenue data and group by model family
(provider), showing family-level rankings and totals.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_model_revenue(timestamp: str | None = None) -> dict[str, Any]:
    """Get revenue data for models."""
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/revenue/model", params=params)


def get_family_revenue(timestamp: str | None = None) -> dict[str, Any]:
    """Get revenue data for token factories (providers/families)."""
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/revenue/token-factory", params=params)


def main() -> None:
    print("Model Family Analytics")
    print("=" * 80)

    # -- Provider/Family revenue ------------------------------------------------
    print("\nProvider Revenue Rankings (latest):")
    print("-" * 40)
    try:
        data = get_family_revenue()
        timestamp = data.get("timestamp", "Unknown")
        items = data.get("items") or []
        print(f"  As of: {timestamp}")
        print(f"  Providers: {len(items)}")
        for i, item in enumerate(sorted(items, key=lambda x: x.get("revenue_usd", 0), reverse=True)[:10], 1):
            name = item.get("resource_id", "Unknown")
            rev = item.get("revenue_usd", 0)
            print(f"  {i}. {name:<20} ${rev:>12,.2f}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Top models by provider -------------------------------------------------
    print("\nTop Models (latest):")
    print("-" * 40)
    try:
        data = get_model_revenue()
        timestamp = data.get("timestamp", "Unknown")
        items = data.get("items") or []
        print(f"  As of: {timestamp}")
        print(f"  Models: {len(items)}")
        for i, item in enumerate(sorted(items, key=lambda x: x.get("revenue_usd", 0), reverse=True)[:10], 1):
            name = item.get("resource_id", "Unknown")
            rev = item.get("revenue_usd", 0)
            print(f"  {i}. {name:<40} ${rev:>12,.2f}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
