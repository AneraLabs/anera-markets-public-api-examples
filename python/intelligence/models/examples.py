"""
Example: Model intelligence endpoints.

Demonstrates how to fetch model analytics including daily revenue per model,
rankings, summaries, revenue by factory, and token ratios.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_daily_revenue_per_model(days: int) -> dict[str, Any]:
    """Get daily revenue for all models."""
    return get_json("/api/intelligence/models/daily-revenue-per-model", {"days": days})


def get_rankings(days: int, metric: str = "revenue", limit: int = 20) -> dict[str, Any]:
    """Get model rankings.

    Args:
        days: Number of days to aggregate over (1-90)
        metric: Sort metric ('revenue' or 'tokens')
        limit: Max results to return (1-500)
    """
    return get_json("/api/intelligence/models/rankings", {
        "days": days,
        "metric": metric,
        "limit": limit,
    })


def get_model_overview(model_id: str) -> dict[str, Any]:
    """Get overview for a specific model."""
    return get_json(f"/api/intelligence/models/model/{model_id}")


def get_model_summary(model_id: str, days: int) -> dict[str, Any]:
    """Get summary statistics for a model."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/summary",
        {"days": days},
    )


def get_daily_revenue_by_factory(model_id: str, days: int) -> dict[str, Any]:
    """Get daily revenue broken down by factory for a model."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/breakdown/daily-revenue-by-token-factory",
        {"days": days},
    )


def get_daily_token_ratio(model_id: str, days: int) -> dict[str, Any]:
    """Get daily token ratio breakdown for a model."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/breakdown/daily-token-ratio",
        {"days": days},
    )


def main() -> None:
    print("Model Intelligence")
    print("=" * 80)

    # -- Rankings --------------------------------------------------------------
    print("\nModel Rankings (30d, by revenue):")
    print("-" * 40)
    try:
        rankings = get_rankings(30, "revenue", 5)
        for row in rankings["rows"]:
            print(
                f"  {row['rank']}. {row['model_name']:<30} "
                f"${row['revenue_usd']:>12.2f}  {row['token_count']} tokens"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue per model -----------------------------------------------
    print("\nDaily Revenue Per Model (7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue_per_model(7)
        for entry in data["data"][-3:]:
            models = entry.get("models", [])
            if models:
                top = max(models, key=lambda m: m["revenue_usd"])
                print(f"  {entry['date']}: {len(models)} models (top: {top['model_name']})")
            else:
                print(f"  {entry['date']}: no data")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
