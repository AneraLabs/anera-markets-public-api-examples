"""
Example: Model family intelligence endpoints.

Demonstrates how to fetch model family rankings, daily revenue, family overviews,
summaries, per-model revenue breakdowns, and model rankings within families.

Requires API key authentication. Set ANERA_MARKETS_API_ACCESS_KEY and
ANERA_MARKETS_API_SECRET_KEY environment variables.
"""

from __future__ import annotations

import os
import requests
from typing import Any

from shared.http import get_json


def _headers() -> dict[str, str]:
    return {
        "Accept": "application/json",
        "X-API-ACCESS-KEY": os.environ.get("ANERA_MARKETS_API_ACCESS_KEY", ""),
        "X-API-SECRET-KEY": os.environ.get("ANERA_MARKETS_API_SECRET_KEY", ""),
    }


def get_rankings(
    days: int,
    metric: str = "revenue",
    limit: int | None = None,
) -> dict[str, Any]:
    """Get model family rankings."""
    params: dict[str, Any] = {"days": days, "metric": metric}
    if limit is not None:
        params["limit"] = limit
    return get_json("/api/intelligence/model-family/rankings", params, _headers())


def get_daily_revenue(days: int) -> dict[str, Any]:
    """Get daily revenue across model families."""
    return get_json("/api/intelligence/model-family/daily-revenue", {"days": days}, _headers())


def get_family_overview(family_id: str) -> dict[str, Any]:
    """Get model family overview."""
    return get_json(f"/api/intelligence/model-family/family/{family_id}", headers=_headers())


def get_family_summary(family_id: str, days: int) -> dict[str, Any]:
    """Get model family summary statistics."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/summary",
        {"days": days},
        _headers(),
    )


def get_daily_revenue_per_model(family_id: str, days: int) -> dict[str, Any]:
    """Get family revenue per model."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/breakdown/daily-revenue-per-model",
        {"days": days},
        _headers(),
    )


def get_model_rankings(family_id: str, metric: str = "revenue") -> dict[str, Any]:
    """Get model rankings within a family."""
    return get_json(
        f"/api/intelligence/model-family/family/{family_id}/breakdown/model-rankings",
        {"metric": metric},
        _headers(),
    )


def main() -> None:
    print("Model Family Intelligence")
    print("=" * 80)

    # -- Rankings ---------------------------------------------------------------
    print("\nModel Family Rankings (30d, by revenue):")
    print("-" * 40)
    top_family_id = ""
    try:
        rankings = get_rankings(30, "revenue", 10)
        for row in rankings.get("rows", []):
            print(
                f"  {row['rank']}. {row['family_name']:<20} ${row['revenue_usd']:>12,.2f}  {row['token_count']} tokens"
            )
        if rankings.get("rows"):
            top_family_id = rankings["rows"][0]["family_id"]
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue ----------------------------------------------------------
    print("\nDaily Revenue (7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue(7)
        for entry in data.get("data", []):
            total = sum(f.get("revenue_usd", 0) for f in entry.get("families", []))
            print(f"  {entry['date']}: ${total:,.2f} ({len(entry.get('families', []))} families)")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    if not top_family_id:
        print("\nNo family ID available to demonstrate detail endpoints.")
        print("Ensure API keys are set and rankings returned results.")
        print("\n" + "=" * 80)
        return

    # -- Family overview --------------------------------------------------------
    print(f"\nFamily Overview ({top_family_id}):")
    print("-" * 40)
    try:
        overview = get_family_overview(top_family_id)
        print(f"  Name: {overview.get('family_name')}")
        print(f"  Description: {overview.get('description', '')}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Family summary ---------------------------------------------------------
    print(f"\nFamily Summary ({top_family_id}, 30d):")
    print("-" * 40)
    try:
        summary = get_family_summary(top_family_id, 30)
        print(f"  Period: {summary.get('from_date')} to {summary.get('to_date')}")
        print(f"  Models supported: {summary.get('models_supported_period')}")
        print(f"  Revenue: ${summary.get('revenue_usd_period', 0):,.2f}")
        print(f"  Revenue stddev: ${summary.get('revenue_stddev_usd_period', 0):,.2f}")
        gp = summary.get("gross_profit_usd_period")
        print(f"  Gross profit: ${gp:,.2f}" if gp is not None else "  Gross profit: N/A")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue per model ------------------------------------------------
    print(f"\nDaily Revenue Per Model ({top_family_id}, 7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue_per_model(top_family_id, 7)
        for entry in data.get("data", [])[-3:]:
            models = entry.get("models", [])
            print(f"  {entry['date']}: {len(models)} models")
            top = sorted(models, key=lambda x: x.get("revenue_usd", 0), reverse=True)[0] if models else None
            if top:
                print(f"    Top: {top.get('model_name')} (${top.get('revenue_usd', 0):,.2f})")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Model rankings within family -------------------------------------------
    print(f"\nModel Rankings ({top_family_id}):")
    print("-" * 40)
    try:
        rankings = get_model_rankings(top_family_id, "revenue")
        for row in rankings.get("rows", [])[:5]:
            print(
                f"  {row['rank']}. {row['model_name']:<30} ${row['revenue_usd']:>12,.2f}  {row['token_count']} tokens"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
