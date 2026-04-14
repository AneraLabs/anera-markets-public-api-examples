"""
Example: Get attestation for a prediction market event.

Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
Example: export ANERA_MARKETS_API_BASE_URL=https://api.example.com
"""

from __future__ import annotations

import json
import os
from typing import Any

import requests


def _base_url() -> str:
    base = os.environ.get("ANERA_MARKETS_API_BASE_URL", "").strip().rstrip("/")
    if not base:
        raise SystemExit(
            "Set ANERA_MARKETS_API_BASE_URL to the API origin, e.g. "
            "export ANERA_MARKETS_API_BASE_URL=https://api.example.com"
        )
    return base


def get_attestation(event_id: str) -> dict[str, Any]:
    """
    Get attestation for a prediction market event.

    Args:
        event_id: Unique identifier for the event

    Returns:
        Attestation response with event_id, start_time, end_time, finalised_time, outcome

    Raises:
        requests.HTTPError: 404 if event not found
    """
    url = f"{_base_url()}/api/v1/public/attestations/{event_id}"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


def main() -> None:
    event_id = "evt_123456789"

    print(f"Fetching attestation for event: {event_id}")
    print("-" * 50)

    try:
        attestation = get_attestation(event_id)

        print(f"Event ID: {attestation['event_id']}")
        print(f"Start Time: {attestation['start_time']}")
        print(f"End Time: {attestation['end_time']}")

        finalised_time = attestation.get("finalised_time")
        outcome = attestation.get("outcome")

        if finalised_time is None and outcome is None:
            print("\nStatus: UNRESOLVED")
            print("The event exists but has not been finalised yet.")
        elif finalised_time is not None and outcome is not None:
            print("\nStatus: RESOLVED")
            print(f"Finalised at: {finalised_time}")
            print("Outcome:")
            print(json.dumps(outcome, indent=2))
        else:
            print("\nStatus: UNKNOWN")
            print("Unexpected response state.")

    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 404:
            print(f"\nStatus: UNKNOWN")
            print(f"Event '{event_id}' not found (404)")
            print("The event_id does not exist in the database.")
        else:
            raise


if __name__ == "__main__":
    main()
