"""
Example: Get ticker values.

Demonstrates how to fetch historical ticker data for a symbol
using the anera.markets API.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import os
from typing import Any

import requests

from shared.http import get_json


def get_ticker_history(
    symbol: str,
    *,
    start_date: str | None = None,
    end_date: str | None = None,
    time_period: int | None = None,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Get historical ticker data for a symbol.

    Uses ``start_date`` / ``end_date`` for an explicit date range.
    Alternatively, pass ``time_period`` to fetch the last N days of data
    (defaults to 7 days if neither is provided).

    An ``api_key`` is required for ``time_period`` values exceeding 7 days.
    """
    params: dict[str, Any] = {}
    if start_date is not None:
        params["startDate"] = start_date
    if end_date is not None:
        params["endDate"] = end_date
    if time_period is not None:
        params["time_period"] = time_period
    headers = {"Authorization": f"Bearer {api_key}"} if api_key else None
    return get_json(f"/api/v1/tickers/{symbol}", params=params, headers=headers)


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

    # -- Custom lookback with time_period (free 7-day window) --------------------
    print(f"\nLast 4 days for {symbol} (time_period=4):")
    print("-" * 40)
    try:
        resp = get_ticker_history(symbol, time_period=4)
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

    # -- Shorter lookback ------------------------------------------------------
    print(f"\nLast 2 days for {symbol} (time_period=2):")
    print("-" * 40)
    try:
        resp = get_ticker_history(symbol, time_period=2)
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

    # -- Extended lookback (requires API key) -------------------------------------
    print(f"\nLast 30 days for {symbol} (time_period=30, requires API key):")
    print("-" * 40)
    api_key = os.getenv("ANERA_MARKETS_API_KEY")
    if not api_key:
        print("  Skipping: set ANERA_MARKETS_API_KEY to query more than 7 days of history.")
    else:
        try:
            resp = get_ticker_history(symbol, time_period=30, api_key=api_key)
            items = resp.get("items") or []
            if not items:
                print("  No data available")
            else:
                print(f"  {len(items)} data points:")
                print(f"    First: {items[0]['timestamp']}: {items[0]['value']:.2f}")
                print(f"    Last:  {items[-1]['timestamp']}: {items[-1]['value']:.2f}")
        except requests.HTTPError as e:
            print(f"  Error: {e}")
            if e.response is not None:
                print(f"  Response: {e.response.text[:200]}")

    print()


if __name__ == "__main__":
    main()
