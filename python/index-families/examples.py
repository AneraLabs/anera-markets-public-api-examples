"""
Example: List index families.

Demonstrates how to fetch all index families and their primary index details.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_index_families() -> list[dict[str, Any]]:
    """Get all index families."""
    return get_json("/api/index-families")


def main() -> None:
    print("Index Families")
    print("=" * 80)

    try:
        families = get_index_families()

        for family in families:
            print(f"\n{family['family_name']}")
            print(f"  ID: {family['family_id']}")
            print(f"  Description: {family['family_description']}")
            print(f"  Tickers: {', '.join(family['family_tickers'])}")

            primary = family.get("primary_index")
            if primary:
                print(f"  Primary Index:")
                print(f"    ID: {primary.get('index_id', 'N/A')}")
                print(f"    Name: {primary['index_name']}")
                value = primary.get("index_value")
                if value is not None:
                    print(f"    Value: {value:.2f}")
    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
