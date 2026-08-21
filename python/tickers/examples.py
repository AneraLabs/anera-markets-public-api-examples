"""
Example: Get ticker values.

Demonstrates how to fetch historical ticker data for an index using the
anera.markets API. The path parameter is the index id (e.g. ``ai-tdi`` or
``ai-tdi-v1``), not the ticker symbol.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import os
from typing import Any

import requests

from shared.http import get_json


def get_ticker_history(
    index_id: str,
    *,
    start_date: str | None = None,
    end_date: str | None = None,
    time_period: int | None = None,
    api_key: str | None = None,
) -> dict[str, Any]:
    """
    Get historical ticker data for an index.

    ``index_id`` is the index id (e.g. 'ai-tdi' or 'ai-tdi-v1'), not a ticker
    symbol. The base id resolves to the highest version.

    Uses ``start_date`` / ``end_date`` for an explicit date range; both must
    be provided together (one alone returns 400). Alternatively, pass
    ``time_period`` to fetch the last N days of data (defaults to 7 days,
    max 365).

    ``api_key`` is OPTIONAL (guests currently get the full window) and is
    sent as the raw ``Authorization`` header value when provided — never
    with a ``Bearer`` prefix.
    """
    params: dict[str, Any] = {}
    if start_date is not None:
        params["startDate"] = start_date
    if end_date is not None:
        params["endDate"] = end_date
    if time_period is not None:
        params["time_period"] = time_period
    headers = {"Authorization": api_key} if api_key else None
    return get_json(f"/api/v1/tickers/{index_id}", params=params, headers=headers)


def main() -> None:
    index_id = "ai-tdi"

    # -- Historical data (explicit date range) ----------------------------------
    print(f"Historical data for {index_id} (date range):")
    print("-" * 40)
    try:
        resp = get_ticker_history(index_id, start_date="2026-06-30", end_date="2026-07-06")
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

    # -- Custom lookback with time_period ---------------------------------------
    print(f"\nLast 4 days for {index_id} (time_period=4):")
    print("-" * 40)
    try:
        resp = get_ticker_history(index_id, time_period=4)
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
    print(f"\nLast 2 days for {index_id} (time_period=2):")
    print("-" * 40)
    try:
        resp = get_ticker_history(index_id, time_period=2)
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

    # -- Extended lookback (API key optional) -----------------------------------
    print(f"\nLast 30 days for {index_id} (time_period=30):")
    print("-" * 40)
    api_key = os.getenv("ANERA_MARKETS_API_KEY")  # optional; guests currently get the full window
    try:
        resp = get_ticker_history(index_id, time_period=30, api_key=api_key)
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
