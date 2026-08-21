"""
Example: Fetch market indices.

Demonstrates how to list all indices, get summary stats, fetch
details for a single index, and query historical data for a date range.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import os
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
    """Get detailed information for a single index.

    Takes the exact index id (e.g., 'ai-tdi-v1'); this endpoint requires an
    exact match, so bare ids like 'ai-tdi' will 404 here.
    """
    return get_json(f"/api/v1/indices/{index_id}")


def get_index_history(
    index_id: str,
    *,
    start_date: str,
    end_date: str,
    api_key: str | None = None,
) -> dict[str, Any]:
    """Get historical ticker values for an index over a date range.

    Uses the public tickers endpoint, which takes the index id (e.g. 'ai-tdi-v1')
    and requires both startDate and endDate. Guests can currently read the full
    window; an API key is optional and sent as the raw Authorization header
    value when provided.

    Returns a response with 'items' list of {timestamp, value} dicts.
    """
    req_headers: dict[str, str] = {}
    if api_key:
        req_headers["Authorization"] = api_key
    return get_json(
        f"/api/v1/tickers/{index_id}",
        {"startDate": start_date, "endDate": end_date},
        headers=req_headers,
    )


def main() -> None:
    print("Market Indices")
    print("=" * 80)
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

    # Historical data for the last week
    index_id = "ai-coi-frontier-oss-v1"
    today = datetime.now().date()
    one_week_ago = today - timedelta(days=7)
    print(f"\nHistorical data for {index_id} (last 7 days, {one_week_ago} to {today}):")
    print("-" * 40)
    try:
        history = get_index_history(
            index_id=index_id,
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

    # Historical data for the last 30 days
    thirty_days_ago = today - timedelta(days=30)
    print(f"\nHistorical data for {index_id} (last 30 days, {thirty_days_ago} to {today}):")
    print("-" * 40)
    try:
        api_key = os.getenv("ANERA_MARKETS_API_KEY")  # optional
        history = get_index_history(
            index_id=index_id,
            start_date=str(thirty_days_ago),
            end_date=str(today),
            api_key=api_key,
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
