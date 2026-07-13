"""
Example: Token factory intelligence endpoints.

Demonstrates how to fetch token factory analytics including daily revenue,
rankings, factory overviews, summaries, per-model revenue breakdowns,
and model rankings within factories.

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


def get_rankings(metric: str = "revenue", limit: int = 20) -> dict[str, Any]:
    """Get token factory rankings."""
    return get_json("/api/v1/intelligence/token-factory/rankings", {"metric": metric, "limit": limit}, _headers())


def get_daily_revenue(days: int) -> dict[str, Any]:
    """Get daily revenue across token factories."""
    return get_json("/api/v1/intelligence/token-factory/daily-revenue", {"days": days}, _headers())


def get_factory_overview(factory_id: str) -> dict[str, Any]:
    """Get token factory overview."""
    return get_json(f"/api/v1/intelligence/token-factory/factory/{factory_id}", headers=_headers())


def get_factory_summary(factory_id: str, days: int) -> dict[str, Any]:
    """Get token factory summary statistics."""
    return get_json(
        f"/api/v1/intelligence/token-factory/factory/{factory_id}/summary",
        {"days": days},
        _headers(),
    )


def get_daily_revenue_per_model(factory_id: str, days: int) -> dict[str, Any]:
    """Get factory revenue per model."""
    return get_json(
        f"/api/v1/intelligence/token-factory/factory/{factory_id}/breakdown/daily-revenue-per-model",
        {"days": days},
        _headers(),
    )


def get_model_rankings(factory_id: str, metric: str = "revenue") -> dict[str, Any]:
    """Get model rankings within a factory."""
    return get_json(
        f"/api/v1/intelligence/token-factory/factory/{factory_id}/breakdown/model-rankings",
        {"metric": metric},
        _headers(),
    )


def main() -> None:
    print("Token Factory Intelligence")
    print("=" * 80)

    # -- Rankings ---------------------------------------------------------------
    print("\nFactory Rankings (by revenue):")
    print("-" * 40)
    top_factory_id = ""
    try:
        rankings = get_rankings("revenue", 5)
        for row in rankings.get("rows", []):
            print(
                f"  {row['rank']}. {row['factory_name']}: ${row['revenue_usd']:,.2f} "
                f"({row.get('token_utilisation', 0):,} tokens)"
            )
        if rankings.get("rows"):
            top_factory_id = rankings["rows"][0]["factory_id"]
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue ----------------------------------------------------------
    print("\nDaily Revenue (7 days):")
    print("-" * 40)
    try:
        data = get_daily_revenue(7)
        for entry in data.get("data", [])[-3:]:
            print(f"  {entry['date']}: {len(entry.get('factories', []))} factories")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    if not top_factory_id:
        print("\nNo factory ID available to demonstrate detail endpoints.")
        print("Ensure API keys are set and rankings returned results.")
        print("\n" + "=" * 80)
        return

    # -- Factory overview -------------------------------------------------------
    print(f"\nFactory Overview ({top_factory_id}):")
    print("-" * 40)
    try:
        overview = get_factory_overview(top_factory_id)
        print(f"  Name: {overview.get('factory_name')}")
        print(f"  Description: {overview.get('description', '')}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Factory summary --------------------------------------------------------
    print(f"\nFactory Summary ({top_factory_id}, 30d):")
    print("-" * 40)
    try:
        summary = get_factory_summary(top_factory_id, 30)
        print(f"  Period: {summary.get('from_date')} to {summary.get('to_date')}")
        print(f"  Models supported: {summary.get('models_supported_period')}")
        print(f"  Revenue: ${summary.get('revenue_usd_period', 0):,.2f}")
        print(f"  Revenue stddev: ${summary.get('revenue_stddev_usd_period', 0):,.2f}")
        gp = summary.get("gross_profit_usd_period")
        print(f"  Gross profit: ${gp:,.2f}" if gp is not None else "  Gross profit: N/A")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue per model ------------------------------------------------
    print(f"\nDaily Revenue Per Model ({top_factory_id}, 7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue_per_model(top_factory_id, 7)
        for entry in data.get("data", [])[-3:]:
            models = entry.get("models", [])
            print(f"  {entry['date']}: {len(models)} models")
            top = sorted(models, key=lambda x: x.get("revenue_usd", 0), reverse=True)[0] if models else None
            if top:
                print(f"    Top: {top.get('model_name')} (${top.get('revenue_usd', 0):,.2f})")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Model rankings within factory ------------------------------------------
    print(f"\nModel Rankings ({top_factory_id}):")
    print("-" * 40)
    try:
        rankings = get_model_rankings(top_factory_id, "revenue")
        for row in rankings.get("rows", [])[:5]:
            print(
                f"  {row['rank']}. {row['model_name']:<30} ${row['revenue_usd']:>12,.2f}  {row['token_count']} tokens"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
