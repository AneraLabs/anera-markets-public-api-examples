"""
Example: Get ticker values.

Demonstrates how to fetch historical ticker data for a symbol
using the anera.markets API.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_ticker_history(
    symbol: str,
    *,
    start_date: str | None = None,
    end_date: str | None = None,
) -> dict[str, Any]:
    """
    Get historical ticker data for a symbol.

    Uses ``start_date`` / ``end_date`` for an explicit date range.
    If omitted, the API defaults to the last 30 days.
    """
    params: dict[str, Any] = {}
    if start_date is not None:
        params["startDate"] = start_date
    if end_date is not None:
        params["endDate"] = end_date
    return get_json(f"/api/v1/tickers/{symbol}", params=params)


def main() -> None:
    symbol = "AI-TDI"

    # -- Historical data (explicit date range) ----------------------------------
    print(f"Historical data for {symbol} (date range):")
    print("-" * 40)
    try:
        resp = get_ticker_history(symbol, start_date="2026-06-30", end_date="2026-07-06")
        items = resp.get("items") or []
        if not items:
            print("  No data available for this range")
        else:
            print(f"  {len(items)} data points:")
            for pt in items:
                print(f"    {pt['timestamp']}: {pt['value']:.2f}")
    except requests.HTTPError as e:
        print(f"  Error: {e}")
        if e.response is not None:
            print(f"  Response: {e.response.text[:200]}")

    # -- Default (last 30 days) -------------------------------------------------
    print(f"\nRecent data for {symbol} (default 30 days):")
    print("-" * 40)
    try:
        resp = get_ticker_history(symbol)
        items = resp.get("items") or []
        if not items:
            print("  No data available")
        else:
            print(f"  {len(items)} data points:")
            for pt in items:
                print(f"    {pt['timestamp']}: {pt['value']:.2f}")
    except requests.HTTPError as e:
        print(f"  Error: {e}")
        if e.response is not None:
            print(f"  Response: {e.response.text[:200]}")

    print()


if __name__ == "__main__":
    main()
