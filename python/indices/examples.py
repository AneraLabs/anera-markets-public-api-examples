"""
Example: Fetch market indices.

Demonstrates how to list all indices, get summary stats, fetch
details for a single index, and query historical data for a date range.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from datetime import datetime, timedelta
from typing import Any

from shared.http import get_json


def get_indices(*, featured: bool | None = None) -> dict[str, Any]:
    """Get all market indices.

    Optionally filter by featured status.
    Returns a response with 'indices' list and 'lastUpdated' timestamp.
    """
    params: dict[str, Any] = {}
    if featured is not None:
        params["featured"] = "true" if featured else "false"
    return get_json("/api/v1/indices", params=params)


def get_indices_summary() -> dict[str, Any]:
    """Get summary statistics for indices.

    Returns models_count and token_spend.
    """
    return get_json("/api/v1/indices/summary")


def get_index(index_id: str) -> dict[str, Any]:
    """Get detailed information for a single index."""
    return get_json(f"/api/v1/indices/{index_id}")


def get_index_history(
    symbol: str, *, start_date: str, end_date: str
) -> dict[str, Any]:
    """Get historical ticker values for an index symbol over a date range.

    Uses the public tickers endpoint. Unauthenticated requests are limited
    to 7 days of history. Supply a Bearer token for wider ranges.

    Args:
        symbol: Ticker symbol (e.g., 'AI-TDI', 'ACTDI').
        start_date: Start date in YYYY-MM-DD format (inclusive).
        end_date: End date in YYYY-MM-DD format (inclusive).

    Returns a response with 'items' list of {timestamp, value} dicts.
    """
    return get_json(
        f"/api/v1/tickers/{symbol}",
        {"startDate": start_date, "endDate": end_date},
    )


def main() -> None:
    print("Market Indices")
    print("=" * 80)

    # Featured indices
    print("\nFeatured indices:")
    print("-" * 40)
    try:
        data = get_indices(featured=False)
        print(f"Last updated: {data['lastUpdated']}")
        for idx in data["indices"]:
            print(f"  [{idx['symbol']}]- {idx['name']}")
            print(f"    API ID : {idx['id']}")
            print(f"    Value: {idx['value']:.2f} {idx['currency']}")
            print(
                f"    Change (1D/1W/1M/3M): "
                f"{idx['changeDay']:.2f}% / {idx['changeWeek']:.2f}% / "
                f"{idx['changeMonth']:.2f}% / {idx['change3Month']:.2f}%"
            )
            print(f"    Description : {idx['description'][:60]}..")
            print("")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # Summary
    print("\nSummary:")
    print("-" * 40)
    try:
        summary = get_indices_summary()
        print(f"  Models count: {summary['models_count']}")
        print(f"  Token spend: {summary['token_spend']}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # Single index
    print("\nSingle index detail:")
    print("-" * 40)
    try:
        idx = get_index("actdi-v3-core-index")
        print(f"  {idx['name']} ({idx['symbol']})")
        group = idx.get("group")
        print(f"  Group: {group['name'] if group else 'N/A'}")
        print(f"  Featured: {idx['featured']}")
        start = idx.get("startDate")
        if start:
            print(f"  Start date: {start}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    # Historical data for the last week via the public tickers endpoint
    today = datetime.now().date()
    one_week_ago = today - timedelta(days=7)
    print(f"\nHistorical data for AI-TDI (last 7 days, {one_week_ago} to {today}):")
    print("-" * 40)
    try:
        history = get_index_history(
            symbol="AI-TDI",
            start_date=str(one_week_ago),
            end_date=str(today),
        )
        items = history.get("items") or []
        if not items:
            print("  No data points returned.")
        for item in items:
            ts = item.get("timestamp", "?")
            val = item.get("value")
            print(f"  {ts}: {val:.2f}" if val is not None else f"  {ts}: N/A")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
