/**
 * Example: List index families.
 *
 * Demonstrates how to fetch index families from the dedicated
 * index-families endpoint.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import { getJson } from "@anera/shared-client";
import { run } from "@anera/shared-client/util";
import type { IndexFamily } from "./types.js";

async function getIndexFamilies(): Promise<IndexFamily[]> {
  return getJson<IndexFamily[]>("/api/v1/index-families");
}

async function main(): Promise<void> {
  console.log("Index Families");
  console.log("=".repeat(80));

  try {
    const families = await getIndexFamilies();
    if (families.length === 0) {
      console.log("No index families available");
    }
    for (const family of families) {
      console.log(`\n${family.family_name} (${family.family_id}):`);
      const description = family.family_description;
      console.log(`  Description: ${description.length > 100 ? `${description.substring(0, 100)}...` : description}`);
      console.log(`  Tickers: ${family.family_tickers.join(", ")}`);
      const primary = family.primary_index;
      if (primary) {
        const value = primary.index_value !== null ? ` ${primary.index_value.toFixed(2)}` : "";
        console.log(`  Primary index: ${primary.symbol} (value:${value}, trend: ${primary.trend})`);
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(80));
}

run(main);