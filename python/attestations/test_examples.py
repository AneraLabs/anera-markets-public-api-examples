"""
Test script to verify attestation example output consistency.

Tests three scenarios:
1. Unknown event (404)
2. Unresolved event (finalised_time=null, outcome=null)
3. Resolved event (finalised_time=timestamp, outcome=data)
"""

from __future__ import annotations

import json
import os
from typing import Any

import requests


def _base_url() -> str:
    base = os.environ.get("ANERA_MARKETS_API_BASE_URL", "https://api.anera.markets").strip().rstrip("/")
    return base


def get_attestation(event_id: str) -> dict[str, Any]:
    url = f"{_base_url()}/api/v1/public/attestations/{event_id}"
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return r.json()


def test_unknown_event() -> str:
    """Test unknown event returns 404."""
    event_id = "evt_unknown"
    output_lines = []
    output_lines.append(f"Fetching attestation for event: {event_id}")
    output_lines.append("-" * 50)

    try:
        get_attestation(event_id)
        output_lines.append("ERROR: Expected 404 but request succeeded")
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 404:
            output_lines.append("Status: UNKNOWN")
            output_lines.append(f"Event '{event_id}' not found (404)")
            output_lines.append("The event_id does not exist in the database.")
        else:
            output_lines.append(f"ERROR: Unexpected HTTP error: {e}")

    return "\n".join(output_lines)


def test_unresolved_event() -> str:
    """Test unresolved event returns null finalised_time and outcome."""
    event_id = "evt_test_123"
    output_lines = []
    output_lines.append(f"Fetching attestation for event: {event_id}")
    output_lines.append("-" * 50)

    try:
        attestation = get_attestation(event_id)
        output_lines.append(f"Event ID: {attestation['event_id']}")
        output_lines.append(f"Start Time: {attestation['start_time']}")
        output_lines.append(f"End Time: {attestation['end_time']}")

        finalised_time = attestation.get("finalised_time")
        outcome = attestation.get("outcome")

        if finalised_time is None and outcome is None:
            output_lines.append("")
            output_lines.append("Status: UNRESOLVED")
            output_lines.append("The event exists but has not been finalised yet.")
        else:
            output_lines.append("")
            output_lines.append("ERROR: Expected unresolved but got different state")

    except requests.HTTPError as e:
        output_lines.append(f"ERROR: Unexpected HTTP error: {e}")

    return "\n".join(output_lines)


def test_resolved_event() -> str:
    """Test resolved event returns non-null finalised_time and outcome."""
    event_id = "evt_resolved_456"
    output_lines = []
    output_lines.append(f"Fetching attestation for event: {event_id}")
    output_lines.append("-" * 50)

    try:
        attestation = get_attestation(event_id)
        output_lines.append(f"Event ID: {attestation['event_id']}")
        output_lines.append(f"Start Time: {attestation['start_time']}")
        output_lines.append(f"End Time: {attestation['end_time']}")

        finalised_time = attestation.get("finalised_time")
        outcome = attestation.get("outcome")

        if finalised_time is not None and outcome is not None:
            output_lines.append("")
            output_lines.append("Status: RESOLVED")
            output_lines.append(f"Finalised at: {finalised_time}")
            output_lines.append("Outcome:")
            output_lines.append(json.dumps(outcome, indent=2))
        else:
            output_lines.append("")
            output_lines.append("ERROR: Expected resolved but got different state")

    except requests.HTTPError as e:
        output_lines.append(f"ERROR: Unexpected HTTP error: {e}")

    return "\n".join(output_lines)


def main() -> None:
    print("=" * 60)
    print("PYTHON ATTESTATION TESTS")
    print("=" * 60)

    print("\n--- Test 1: Unknown Event (404) ---\n")
    print(test_unknown_event())

    print("\n--- Test 2: Unresolved Event ---\n")
    print(test_unresolved_event())

    print("\n--- Test 3: Resolved Event ---\n")
    print(test_resolved_event())

    print("\n" + "=" * 60)
    print("ALL TESTS COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
