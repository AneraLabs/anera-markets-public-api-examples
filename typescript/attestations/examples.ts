/**
 * Example: Get attestation for a prediction market event.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type { AttestationResponse } from "./types.js";
import { getJson } from "./client.js";

async function main(): Promise<void> {
  const eventId = "evt_123456789";

  console.log(`Fetching attestation for event: ${eventId}`);
  console.log("-".repeat(50));

  try {
    const attestation: AttestationResponse = await getJson<AttestationResponse>(
      `/api/v1/attestations/${eventId}`,
    );

    console.log(`Event ID: ${attestation.event_id}`);
    console.log(`Start Time: ${attestation.start_time}`);
    console.log(`End Time: ${attestation.end_time}`);

    const { finalised_time: finalisedTime, outcome } = attestation;

    if (finalisedTime === null && outcome === null) {
      console.log("\nStatus: UNRESOLVED");
      console.log("The event exists but has not been finalised yet.");
    } else if (finalisedTime !== null && outcome !== null) {
      console.log("\nStatus: RESOLVED");
      console.log(`Finalised at: ${finalisedTime}`);
      console.log("Outcome:");
      console.log(JSON.stringify(outcome, null, 2));
    } else {
      console.log("\nStatus: UNKNOWN");
      console.log("Unexpected response state.");
    }
  } catch (err) {
    const error = err as Error;
    if (error.message.includes("404")) {
      console.log("\nStatus: UNKNOWN");
      console.log(`Event '${eventId}' not found (404)`);
      console.log("The event_id does not exist in the database.");
    } else {
      throw err;
    }
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
