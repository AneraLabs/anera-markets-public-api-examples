"""
Example: Get top models by revenue.

This example demonstrates how to request model revenue data and display the
top revenue-generating models with their rankings.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


# Configuration
TOP_N = 20  # Number of top models to display
TIMESTAMP = None  # Set to "YYYY-MM-DD" for specific date, or None for latest


def get_model_revenue(timestamp: str | None = None) -> dict[str, Any]:
    """Get revenue data for models."""
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/revenue/model", params=params)


def main() -> None:
    """Fetch and display top models by revenue."""
    data = get_model_revenue(timestamp=TIMESTAMP)
    items = data.get("items") or []
    timestamp = data.get("timestamp", "Latest")

    print(f"Top Models by Revenue ({timestamp})")
    print("=" * 80)
    print(f"{'Rank':<6}{'Model':<50}{'Revenue (USD)':<20}")
    print("-" * 80)

    for i, item in enumerate(items[:TOP_N], 1):
        model = item.get("resource_id", "Unknown")
        revenue = item.get("revenue_usd", 0)
        print(f"{i:<6}{model:<50}${revenue:>19,.2f}")

    print("=" * 80)


if __name__ == "__main__":
    main()
