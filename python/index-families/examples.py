"""
Example: List index families.

Demonstrates how to fetch index families (family metadata, member tickers,
and primary index details) from the dedicated index-families endpoint.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_index_families() -> list[dict[str, Any]]:
    """Get all index families from the dedicated index-families endpoint."""
    return get_json("/api/v1/index-families")


def main() -> None:
    print("Index Families")
    print("=" * 80)

    try:
        families = get_index_families()
        print(f"Found {len(families)} families")

        for family in families:
            print(f"\n{family['family_name']}:")
            print(f"  Family ID:   {family['family_id']}")
            description = family.get("family_description") or ""
            print(f"  Description: {description[:100]}{'..' if len(description) > 100 else ''}")
            tickers = family.get("family_tickers") or []
            print(f"  Tickers:     {', '.join(tickers)}")

            primary = family.get("primary_index")
            if primary is not None:
                value = primary.get("index_value")
                value_str = f"{value:.2f}" if value is not None else "N/A"
                print(f"  Primary index: {primary['symbol']}")
                print(f"    Value: {value_str}")
                print(f"    Trend: {primary['trend']}")

    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()