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


def get_daily_tokens() -> dict[str, Any]:
    """Get current total token count and previous-day delta.

    Returns:
    - totalCount: Total tokens ingested to date (as string)
    - delta: Previous day's token count (as string)
    - lastUpdated: ISO timestamp when the count was computed
    """
    return get_json("/api/tokens/daily")


def format_number(num_str: str | None) -> str:
    if not num_str or num_str == "None":
        return "N/A"
    num = int(num_str)
    if num >= 1e12:
        return f"{num / 1e12:.2f}T"
    if num >= 1e9:
        return f"{num / 1e9:.2f}B"
    if num >= 1e6:
        return f"{num / 1e6:.2f}M"
    return f"{num:,}"


def main() -> None:
    print("Daily Token Counts")
    print("=" * 80)

    try:
        data = get_daily_tokens()

        print(f"Total tokens ingested: {format_number(data['totalCount'])}")
        print(f"Previous day delta:    {format_number(data['delta'])}")
        print(f"Last updated:          {data['lastUpdated']}")

        delta_str = data.get("delta")
        if delta_str and delta_str != "None":
            per_second = int(delta_str) / 86400
            print(f"Approx. tokens/sec:    {per_second:,.0f}")
        else:
            print("Approx. tokens/sec:    N/A")

    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
