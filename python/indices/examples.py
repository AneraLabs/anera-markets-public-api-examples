"""
Example: Fetch market indices.

Demonstrates how to list all indices, get summary stats, and fetch
details for a single index.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_indices(*, featured: bool | None = None) -> dict[str, Any]:
    """Get all market indices.

    Optionally filter by featured status.
    Returns a response with 'indices' list and 'lastUpdated' timestamp.
    """
    params: dict[str, Any] = {}
    if featured is not None:
        params["featured"] = str(featured)
    return get_json("/api/indices", params)


def get_indices_summary() -> dict[str, Any]:
    """Get summary statistics for indices.

    Returns models_count and token_spend.
    """
    return get_json("/api/indices/summary")


def get_index(index_id: str) -> dict[str, Any]:
    """Get detailed information for a single index."""
    return get_json(f"/api/indices/{index_id}")


def main() -> None:
    print("Market Indices")
    print("=" * 80)

    # Featured indices
    print("\nFeatured indices:")
    print("-" * 40)
    try:
        data = get_indices(featured=True)
        print(f"Last updated: {data['lastUpdated']}")
        for idx in data["indices"]:
            print(f"  {idx['symbol']} - {idx['name']}")
            print(f"    Value: {idx['value']:.2f} {idx['currency']}")
            print(
                f"    Change (1D/1W/1M/3M): "
                f"{idx['changeDay']:.2f}% / {idx['changeWeek']:.2f}% / "
                f"{idx['changeMonth']:.2f}% / {idx['change3Month']:.2f}%"
            )
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
        idx = get_index("actdi-core-index")
        print(f"  {idx['name']} ({idx['symbol']})")
        group = idx.get("group")
        print(f"  Group: {group['name'] if group else 'N/A'}")
        print(f"  Featured: {idx['featured']}")
        start = idx.get("startDate")
        if start:
            print(f"  Start date: {start}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
