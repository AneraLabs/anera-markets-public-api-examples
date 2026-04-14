"""
Example: Revenue trend analysis for a company over time.

This example demonstrates how to track revenue changes for a specific company
across multiple days to identify trends.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import os
from datetime import date, timedelta
from typing import Any

import requests


# Configuration
COMPANY = "anthropic"  # Company to track (e.g., "anthropic", "openai", "google")
DAYS = 7  # Number of days to look back


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


def get_company_revenue(timestamp: str, resource_id: str) -> dict[str, Any]:
    """Get revenue data for a specific company on a specific date."""
    params: dict[str, Any] = {
        "timestamp": timestamp,
        "resource_id": resource_id,
    }
    return _get("/api/v1/public/revenue/company", params=params)


def main() -> None:
    """Fetch and display revenue trend for a company."""
    end_date = date.today()
    start_date = end_date - timedelta(days=DAYS - 1)
    
    print(f"Revenue Trend for {COMPANY} ({DAYS} days)")
    print("=" * 80)
    print(f"{'Date':<15}{'Revenue (USD)':<25}{'Change':<20}")
    print("-" * 80)
    
    prev_revenue: float | None = None
    
    for day_offset in range(DAYS):
        current_date = start_date + timedelta(days=day_offset)
        timestamp = current_date.isoformat()
        
        try:
            data = get_company_revenue(timestamp, COMPANY)
            items = data.get("items") or []
            
            if not items:
                print(f"{timestamp:<15}{'No data':<25}")
                prev_revenue = None
                continue
            
            revenue = items[0].get("revenue_usd", 0)
            
            # Calculate change from previous day
            if prev_revenue is not None and prev_revenue > 0:
                change_pct = ((revenue - prev_revenue) / prev_revenue) * 100
                change_str = f"{change_pct:+.1f}%"
            else:
                change_str = "-"
            
            print(f"{timestamp:<15}${revenue:>23,.2f}{change_str:<20}")
            prev_revenue = revenue
            
        except requests.exceptions.HTTPError as e:
            print(f"{timestamp:<15}Error: {e}")
            prev_revenue = None
    
    print("=" * 80)


if __name__ == "__main__":
    main()
