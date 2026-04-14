"""
Example: Get token utilisation by token type for companies.

This example demonstrates how to request token utilisation data for different
token types (total, prompt, completion, reasoning) and display the top
token-consuming companies for each type.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import json
import os
from typing import Any, Literal

import requests

TokenType = Literal["total", "prompt", "completion", "reasoning"]


# Configure the token types to display
TOKEN_TYPES: list[TokenType] = ["total", "prompt", "completion", "reasoning"]
TOP_N = 10  # Number of top companies to display per token type
TIMESTAMP = "2026-04-13"  # Optional: specific date (omit for latest available)


def _base_url() -> str:
    base = os.environ.get("ANERA_MARKETS_API_BASE_URL", "").strip().rstrip("/")
    if not base:
        raise SystemExit(
            "Set ANERA_MARKETS_API_BASE_URL to the API origin, e.g. "
            "export ANERA_MARKETS_API_BASE_URL=https://api.example.com"
        )
    return base


def _get(path: str, params: dict[str, Any] | None = None) -> Any:
    url = f"{_base_url()}{path}"
    r = requests.get(url, params=params or {}, timeout=60)
    r.raise_for_status()
    return r.json()


def get_token_utilisation(
    token_type: TokenType,
    timestamp: str | None = None,
) -> dict[str, Any]:
    """Get token utilisation data for companies by token type."""
    params: dict[str, Any] = {"token_type": token_type}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return _get("/api/v1/public/token-utilisation/company", params=params)


def format_tokens(count: int) -> str:
    """Format token count with appropriate suffix."""
    if count >= 1e12:
        return f"{count / 1e12:.2f}T"
    elif count >= 1e9:
        return f"{count / 1e9:.2f}B"
    elif count >= 1e6:
        return f"{count / 1e6:.2f}M"
    else:
        return f"{count:,}"


def main() -> None:
    """Fetch and display token utilisation by token type."""
    print(f"Token Utilisation by Type (Date: {TIMESTAMP})")
    print("=" * 80)
    
    for token_type in TOKEN_TYPES:
        print(f"\n{token_type.upper()}:")
        print("-" * 40)
        
        try:
            data = get_token_utilisation(token_type, timestamp=TIMESTAMP)
            items = data.get("items") or []
            
            if not items:
                print("  No data available for this token type")
                continue
            
            # Display top N companies
            for i, item in enumerate(items[:TOP_N], 1):
                token_count = item.get("token_count", 0)
                company = item.get("resource_id", "Unknown")
                formatted = format_tokens(token_count)
                print(f"  {i:2d}. {company}: {formatted} tokens")
                
        except requests.exceptions.HTTPError as e:
            print(f"  Error fetching data: {e}")
            if e.response is not None:
                print(f"  Response: {e.response.text[:200]}")
        except Exception as e:
            print(f"  Unexpected error: {e}")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
