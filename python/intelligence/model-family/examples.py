"""
Example: Model family intelligence endpoints.

Demonstrates how to fetch model family analytics including rankings,
daily revenue, summaries, and per-model breakdowns.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_daily_revenue(days: int) -> dict[str, Any]:
    """Get daily revenue for all model families."""
    return get_json("/api/intelligence/model-family/daily-revenue", {"days": days})


def get_rankings(days: int, metric: str = "revenue", limit: int = 20) -> dict[str, Any]:
    """Get model family rankings."""
    return get_json("/api/intelligence/model-family/rankings", {
        "days": days,
        "metric": metric,
        "limit": limit,
    })


def get_family_overview(family_id: str) -> dict[str, Any]:
    """Get overview for a specific model family."""
    return get_json(f"/api/intelligence/model-family/family/{family_id}")


def get_family_summary(family_id: str, days: int) -> dict[str, Any]:
    """Get summary statistics for a model family."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/summary",
        {"days": days},
    )


def get_daily_revenue_per_model(family_id: str, days: int) -> dict[str, Any]:
    """Get daily revenue breakdown per model within a family."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/breakdown/daily-revenue-per-model",
        {"days": days},
    )


def get_model_rankings(family_id: str, metric: str = "revenue") -> dict[str, Any]:
    """Get model rankings within a family."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/breakdown/model-rankings",
        {"metric": metric},
    )


def main() -> None:
    print("Model Family Intelligence")
    print("=" * 80)

    # -- Rankings --------------------------------------------------------------
    print("\nModel Family Rankings (30d, by revenue):")
    print("-" * 40)
    try:
        rankings = get_rankings(30, "revenue", 10)
        for row in rankings["rows"]:
            print(
                f"  {row['rank']}. {row['family_name']:<20} "
                f"${row['revenue_usd']:>12.2f}  {row['token_count']} tokens"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue ---------------------------------------------------------
    print("\nDaily Revenue (7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue(7)
        for entry in data["data"]:
            total = sum(f["revenue_usd"] for f in entry["families"])
            print(f"  {entry['date']}: ${total:.2f} ({len(entry['families'])} families)")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Family overview -------------------------------------------------------
    print("\nFamily Overview (openai):")
    print("-" * 40)
    try:
        overview = get_family_overview("openai")
        print(f"  {overview['family_name']}: {overview['description']}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
