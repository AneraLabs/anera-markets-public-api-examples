/**
 * Test script to verify attestation example output consistency.
 *
 * Tests three scenarios:
 * 1. Unknown event (404)
 * 2. Unresolved event (finalised_time=null, outcome=null)
 * 3. Resolved event (finalised_time=timestamp, outcome=data)
 */

import type { AttestationResponse } from "./types.js";

function baseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "https://api.anera.markets").trim().replace(/\/$/, "");
  return base;
}

async function getJson<T>(path: string): Promise<T> {
  const url = `${baseUrl()}${path}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function testUnknownEvent(): Promise<string> {
  const eventId = "evt_unknown";
  const outputLines: string[] = [];
  outputLines.push(`Fetching attestation for event: ${eventId}`);
  outputLines.push("-".repeat(50));

  try {
    await getJson<AttestationResponse>(`/api/v1/public/attestations/${eventId}`);
    outputLines.push("ERROR: Expected 404 but request succeeded");
  } catch (err) {
    const error = err as Error;
    if (error.message.includes("404")) {
      outputLines.push("Status: UNKNOWN");
      outputLines.push(`Event '${eventId}' not found (404)`);
      outputLines.push("The event_id does not exist in the database.");
    } else {
      outputLines.push(`ERROR: Unexpected HTTP error: ${error.message}`);
    }
  }

  return outputLines.join("\n");
}

async function testUnresolvedEvent(): Promise<string> {
  const eventId = "evt_test_123";
  const outputLines: string[] = [];
  outputLines.push(`Fetching attestation for event: ${eventId}`);
  outputLines.push("-".repeat(50));

  try {
    const attestation: AttestationResponse = await getJson<AttestationResponse>(
      `/api/v1/public/attestations/${eventId}`,
    );
    outputLines.push(`Event ID: ${attestation.event_id}`);
    outputLines.push(`Start Time: ${attestation.start_time}`);
    outputLines.push(`End Time: ${attestation.end_time}`);

    const { finalised_time: finalisedTime, outcome } = attestation;

    if (finalisedTime === null && outcome === null) {
      outputLines.push("");
      outputLines.push("Status: UNRESOLVED");
      outputLines.push("The event exists but has not been finalised yet.");
    } else {
      outputLines.push("");
      outputLines.push("ERROR: Expected unresolved but got different state");
    }
  } catch (err) {
    outputLines.push(`ERROR: Unexpected HTTP error: ${(err as Error).message}`);
  }

  return outputLines.join("\n");
}

async function testResolvedEvent(): Promise<string> {
  const eventId = "evt_resolved_456";
  const outputLines: string[] = [];
  outputLines.push(`Fetching attestation for event: ${eventId}`);
  outputLines.push("-".repeat(50));

  try {
    const attestation: AttestationResponse = await getJson<AttestationResponse>(
      `/api/v1/public/attestations/${eventId}`,
    );
    outputLines.push(`Event ID: ${attestation.event_id}`);
    outputLines.push(`Start Time: ${attestation.start_time}`);
    outputLines.push(`End Time: ${attestation.end_time}`);

    const { finalised_time: finalisedTime, outcome } = attestation;

    if (finalisedTime !== null && outcome !== null) {
      outputLines.push("");
      outputLines.push("Status: RESOLVED");
      outputLines.push(`Finalised at: ${finalisedTime}`);
      outputLines.push("Outcome:");
      outputLines.push(JSON.stringify(outcome, null, 2));
    } else {
      outputLines.push("");
      outputLines.push("ERROR: Expected resolved but got different state");
    }
  } catch (err) {
    outputLines.push(`ERROR: Unexpected HTTP error: ${(err as Error).message}`);
  }

  return outputLines.join("\n");
}

async function main(): Promise<void> {
  console.log("=".repeat(60));
  console.log("TYPESCRIPT ATTESTATION TESTS");
  console.log("=".repeat(60));

  console.log("\n--- Test 1: Unknown Event (404) ---\n");
  console.log(await testUnknownEvent());

  console.log("\n--- Test 2: Unresolved Event ---\n");
  console.log(await testUnresolvedEvent());

  console.log("\n--- Test 3: Resolved Event ---\n");
  console.log(await testResolvedEvent());

  console.log("\n" + "=".repeat(60));
  console.log("ALL TESTS COMPLETE");
  console.log("=".repeat(60));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
