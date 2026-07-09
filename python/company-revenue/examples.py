"""
Example: Get top company revenue per day for a date range.

This example demonstrates how to request company revenue data for multiple days
and display the top revenue-generating companies for each day in the range.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
"""

from __future__ import annotations

import requests
from datetime import date, timedelta
from typing import Any

from shared.http import get_json


# Configure the date range here
START_DATE = date(2026, 4, 6)
END_DATE = date(2026, 4, 14)
TOP_N = 10  # Number of top companies to display per day


def get_company_revenue(timestamp: str | None = None) -> dict[str, Any]:
    """Get revenue data for companies on a specific date."""
    params: dict[str, Any] = {}
    if timestamp is not None:
        params["timestamp"] = timestamp
    return get_json("/api/v1/public/revenue/company", params=params)


def date_range(start: date, end: date) -> list[date]:
    """Generate a list of dates from start to end (inclusive)."""
    return [start + timedelta(days=i) for i in range((end - start).days + 1)]


def main() -> None:
    """Fetch and display top company revenue for each day in the range."""
    dates = date_range(START_DATE, END_DATE)
    
    print(f"Company Revenue Rankings ({START_DATE} to {END_DATE})")
    print("=" * 80)
    
    for current_date in dates:
        timestamp = current_date.isoformat()
        
        print(f"\n{timestamp}:")
        print("-" * 40)
        
        try:
            data = get_company_revenue(timestamp=timestamp)
            items = data.get("items") or []
            
            if not items:
                print("  No data available for this date")
                continue
            
            # Display top N companies
            for i, item in enumerate(items[:TOP_N], 1):
                revenue = item.get("revenue_usd", 0)
                company = item.get("resource_id", "Unknown")
                print(f"  {i:2d}. {company}: ${revenue:,.2f}")
                
        except requests.exceptions.HTTPError as e:
            print(f"  Error fetching data: {e}")
            if e.response is not None:
                print(f"  Response: {e.response.text[:200]}")
        except Exception as e:
            print(f"  Unexpected error: {e}")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
