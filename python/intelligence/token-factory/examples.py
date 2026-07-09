"""
Example: Token factory intelligence endpoints.

Demonstrates how to fetch token factory analytics including daily revenue,
rankings, summaries, and per-model breakdowns.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_daily_revenue(days: int) -> dict[str, Any]:
    """Get daily revenue for all token factories.

    Args:
        days: Number of days to fetch (1-365)
    """
    return get_json("/api/intelligence/token-factory/daily-revenue", {"days": days})


def get_rankings(metric: str = "revenue", limit: int = 20) -> dict[str, Any]:
    """Get token factory rankings.

    Args:
        metric: Sort metric ('revenue' or 'utilisation')
        limit: Max results to return (1-500)
    """
    return get_json("/api/intelligence/token-factory/rankings", {
        "metric": metric,
        "limit": limit,
    })


def get_factory_overview(factory_id: str) -> dict[str, Any]:
    """Get overview for a specific token factory."""
    return get_json(f"/api/intelligence/token-factory/factory/{factory_id}")


def get_factory_summary(factory_id: str, days: int) -> dict[str, Any]:
    """Get summary statistics for a token factory."""
    return get_json(
        f"/api/intelligence/token-factory/factory/{factory_id}/summary",
        {"days": days},
    )


def get_daily_revenue_per_model(factory_id: str, days: int) -> dict[str, Any]:
    """Get daily revenue broken down by model for a factory."""
    return get_json(
        f"/api/intelligence/token-factory/factory/{factory_id}/breakdown/daily-revenue-per-model",
        {"days": days},
    )


def get_model_rankings(factory_id: str, metric: str = "revenue") -> dict[str, Any]:
    """Get model rankings within a factory."""
    return get_json(
        f"/api/intelligence/token-factory/factory/{factory_id}/breakdown/model-rankings",
        {"metric": metric},
    )


def main() -> None:
    print("Token Factory Intelligence")
    print("=" * 80)

    # -- Rankings --------------------------------------------------------------
    print("\nFactory Rankings (by revenue):")
    print("-" * 40)
    try:
        rankings = get_rankings("revenue", 5)
        for row in rankings["rows"]:
            print(
                f"  {row['rank']}. {row['factory_name']}: "
                f"${row['revenue_usd']:.2f} ({row['token_utilisation']} tokens)"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue ---------------------------------------------------------
    print("\nDaily Revenue (7 days):")
    print("-" * 40)
    try:
        data = get_daily_revenue(7)
        for entry in data["data"][-3:]:
            print(f"  {entry['date']}: {len(entry['factories'])} factories")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
