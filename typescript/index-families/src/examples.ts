/**
 * Example: List index families.
 *
 * Demonstrates how to fetch index data grouped by family, derived from the
 * market indices endpoint.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import { getJson } from "@anera/shared-client";
import { run } from "@anera/shared-client/util";
import type { MarketDataResponse } from "./types.js";

async function getIndices(): Promise<MarketDataResponse> {
  return getJson<MarketDataResponse>("/api/v1/indices");
}

async function main(): Promise<void> {
  console.log("Index Families (derived from indices)");
  console.log("=".repeat(80));

  try {
    const data = await getIndices();
    const indices = data.indices;
    const lastUpdated = data.lastUpdated;
    console.log(`Last updated: ${lastUpdated}`);

    // Group indices by common symbol prefix (family)
    const families: Record<string, typeof indices> = {};
    for (const idx of indices) {
      const parts = idx.symbol.split("-");
      const family = parts[0];
      if (!(family in families)) {
        families[family] = [];
      }
      families[family].push(idx);
    }

    for (const [familyName, members] of Object.entries(families)) {
      console.log(`\n${familyName}:`);
      console.log(`  Members: ${members.length}`);
      const symbols = members.map((m) => m.symbol).join(", ");
      console.log(`  Symbols: ${symbols}`);
      for (const m of members) {
        const valueStr = m.value !== undefined ? `${m.value.toFixed(2)} ${m.currency}`.trim() : "N/A";
        console.log(`    ${m.symbol}: ${valueStr}`);
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(80));
}

run(main);