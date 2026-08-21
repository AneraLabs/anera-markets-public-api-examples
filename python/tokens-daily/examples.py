"""
Example: Get daily token counts.

Demonstrates how to fetch the cumulative total of tokens ingested and the
previous-day delta from the dedicated daily tokens endpoint
(/api/v1/tokens/daily).

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_daily_tokens() -> dict[str, Any]:
    """Get daily token counts from the dedicated tokens/daily endpoint.

    ``totalCount`` is the cumulative number of tokens ingested to date and
    ``delta`` is the change over the previous completed UTC day. Both are
    returned as strings.
    """
    return get_json("/api/v1/tokens/daily")


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
        data = get_daily_tokens()

        total = int(data["totalCount"])
        delta = int(data["delta"])
        last_updated = data.get("lastUpdated", "Unknown")

        print(f"Total tokens ingested (cumulative): {format_number(total)}")
        print(f"Previous UTC day delta:             {format_number(delta)}")
        print(f"Last updated:                       {last_updated}")

    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()