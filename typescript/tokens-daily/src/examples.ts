/**
 * Example: Get daily token counts.
 *
 * Demonstrates how to fetch the cumulative token total and the delta for the
 * previous completed UTC day from the dedicated daily tokens endpoint.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import { getJson } from "@anera/shared-client";
import { formatNumber, run } from "@anera/shared-client/util";
import type { DailyTokensResponse } from "./types.js";

async function main(): Promise<void> {
  console.log("Daily Token Counts");
  console.log("=".repeat(80));

  try {
    const data: DailyTokensResponse = await getJson<DailyTokensResponse>("/api/v1/tokens/daily");

    const total = Number(data.totalCount);
    const delta = Number(data.delta);

    console.log(`Total tokens ingested: ${formatNumber(total)}`);
    console.log(`Delta (previous UTC day): ${formatNumber(delta)}`);
    console.log(`As of:                  ${data.lastUpdated}`);
  } catch (err) {
    const error = err as Error;
    console.error(`Error fetching daily tokens: ${error.message}`);
  }

  console.log("\n" + "=".repeat(80));
}

run(main);