"""
Example: Get daily token counts.

Demonstrates how to fetch the current total token count and previous-day delta
using the anera.markets API.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_total_token_utilisation() -> dict[str, Any]:
    """Get total token utilisation across all companies (latest available day).

    Returns token counts summed across all companies.
    """
    return get_json("/api/v1/token-utilisation/company", params={"token_type": "total"})


def format_number(count: int) -> str:
    if count >= 1e12:
        return f"{count / 1e12:.2f}T"
    if count >= 1e9:
        return f"{count / 1e9:.2f}B"
    if count >= 1e6:
        return f"{count / 1e6:.2f}M"
    return f"{count:,}"


def main() -> None:
    print("Daily Token Counts")
    print("=" * 80)

    try:
        data = get_total_token_utilisation()

        timestamp = data.get("timestamp", "Unknown")
        items = data.get("items") or []

        total = sum(item.get("token_count", 0) for item in items)

        print(f"Total tokens ingested: {format_number(total)}")
        print(f"As of:                  {timestamp}")

        if items:
            top = items[0]
            print(f"Top consumer:           {top.get('resource_name', top.get('resource_id'))} ({format_number(top.get('token_count', 0))} tokens)")
        else:
            print("No data available")

    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
