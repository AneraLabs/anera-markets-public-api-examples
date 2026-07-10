"""
Example: List index families.

Demonstrates how to fetch index data grouped by family, derived from the
market indices endpoint.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
"""

from __future__ import annotations

import requests
from typing import Any

from shared.http import get_json


def get_indices() -> dict[str, Any]:
    """Get all market indices."""
    return get_json("/api/v1/indices")


def main() -> None:
    print("Index Families (derived from indices)")
    print("=" * 80)

    try:
        data = get_indices()
        indices = data.get("indices", [])
        last_updated = data.get("lastUpdated", "N/A")
        print(f"Last updated: {last_updated}")

        # Group indices by common symbol prefix (family)
        families: dict[str, list[dict[str, Any]]] = {}
        for idx in indices:
            symbol = idx.get("symbol", "")
            # Derive family from the prefix before the dash
            family = symbol.split("-")[0] if "-" in symbol else symbol
            if family not in families:
                families[family] = []
            families[family].append(idx)

        for family_name, members in families.items():
            print(f"\n{family_name}:")
            print(f"  Members: {len(members)}")
            symbols = ", ".join(m["symbol"] for m in members)
            print(f"  Symbols: {symbols}")
            for m in members:
                value = m.get("value")
                currency = m.get("currency", "")
                value_str = f"{value:.2f} {currency}".strip() if value is not None else "N/A"
                print(f"    {m['symbol']}: {value_str}")

    except requests.HTTPError as e:
        print(f"Error: {e}")

    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
