"""
Example: Model intelligence endpoints.

Demonstrates how to fetch model analytics including daily revenue per model,
rankings, model overviews, summaries, revenue by factory, and token ratios.

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


def get_daily_revenue_per_model(days: int) -> dict[str, Any]:
    """Get daily revenue aggregated across all models."""
    return get_json("/api/intelligence/models/daily-revenue-per-model", {"days": days}, _headers())


def get_rankings(
    days: int,
    metric: str = "revenue",
    limit: int = 20,
) -> dict[str, Any]:
    """Get model rankings by revenue or tokens."""
    return get_json(
        "/api/intelligence/models/rankings",
        {"days": days, "metric": metric, "limit": limit},
        _headers(),
    )


def get_model_overview(model_id: str) -> dict[str, Any]:
    """Get model overview."""
    return get_json(f"/api/intelligence/models/model/{model_id}", headers=_headers())


def get_model_summary(model_id: str, days: int) -> dict[str, Any]:
    """Get model summary statistics."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/summary",
        {"days": days},
        _headers(),
    )


def get_daily_revenue_by_factory(model_id: str, days: int) -> dict[str, Any]:
    """Get model revenue broken down by token factory."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/breakdown/daily-revenue-by-token-factory",
        {"days": days},
        _headers(),
    )


def get_daily_token_ratio(model_id: str, days: int) -> dict[str, Any]:
    """Get daily token ratio for a model."""
    return get_json(
        f"/api/intelligence/models/model/{model_id}/breakdown/daily-token-ratio",
        {"days": days},
        _headers(),
    )


def main() -> None:
    print("Model Intelligence")
    print("=" * 80)

    # -- Rankings ---------------------------------------------------------------
    print("\nModel Rankings (30d, by revenue):")
    print("-" * 40)
    top_model_id = ""
    try:
        rankings = get_rankings(30, "revenue", 5)
        for row in rankings.get("rows", []):
            print(
                f"  {row['rank']}. {row['model_name']:<30} ${row['revenue_usd']:>12,.2f}  {row['token_count']} tokens"
            )
        if rankings.get("rows"):
            top_model_id = rankings["rows"][0]["model_id"]
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue per model ------------------------------------------------
    print("\nDaily Revenue Per Model (7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue_per_model(7)
        for entry in data.get("data", [])[-3:]:
            models = sorted(entry.get("models", []), key=lambda x: x.get("revenue_usd", 0), reverse=True)
            top = models[0] if models else None
            print(f"  {entry['date']}: {len(models)} models (top: {top.get('model_name') if top else 'N/A'})")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    if not top_model_id:
        print("\nNo model ID available to demonstrate detail endpoints.")
        print("Ensure API keys are set and rankings returned results.")
        print("\n" + "=" * 80)
        return

    # -- Model overview ---------------------------------------------------------
    print(f"\nModel Overview ({top_model_id}):")
    print("-" * 40)
    try:
        overview = get_model_overview(top_model_id)
        print(f"  Name: {overview.get('model_name')}")
        desc = overview.get("description", "")
        print(f"  Description: {desc[:100]}...")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Model summary ----------------------------------------------------------
    print(f"\nModel Summary ({top_model_id}, 30d):")
    print("-" * 40)
    try:
        summary = get_model_summary(top_model_id, 30)
        print(f"  Period: {summary.get('from_date')} to {summary.get('to_date')}")
        print(f"  Avg input/output ratio: {summary.get('avg_input_output_ratio_period', 0):.2f}")
        print(f"  Revenue: ${summary.get('revenue_usd_period', 0):,.2f}")
        print(f"  Revenue stddev: ${summary.get('revenue_stddev_usd_period', 0):,.2f}")
        print(f"  Total tokens: {summary.get('total_tokens_period', 0):,}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily revenue by factory -----------------------------------------------
    print(f"\nDaily Revenue by Factory ({top_model_id}, 7d):")
    print("-" * 40)
    try:
        data = get_daily_revenue_by_factory(top_model_id, 7)
        for entry in data.get("data", [])[-3:]:
            print(f"  {entry['date']}:")
            for factory in entry.get("factories", [])[:3]:
                print(f"    {factory['factory_name']}: ${factory['revenue_usd']:,.2f} ({factory['token_count']:,} tokens)")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # -- Daily token ratio ------------------------------------------------------
    print(f"\nDaily Token Ratio ({top_model_id}, 7d):")
    print("-" * 40)
    try:
        data = get_daily_token_ratio(top_model_id, 7)
        for point in data.get("data", [])[-3:]:
            print(
                f"  {point['date']}: prompt={point['prompt_tokens']}, "
                f"completion={point['completion_tokens']}, "
                f"reasoning={point['reasoning_tokens']}, "
                f"ratio={point['input_output_ratio']:.2f}"
            )
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
