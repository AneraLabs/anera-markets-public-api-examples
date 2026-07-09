/**
 * Example: List index families.
 *
 * Demonstrates how to fetch all index families and their primary index details
 * using the anera.markets API.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type { IndexFamily } from "./types.js";
import { getJson } from "./client.js";

async function getIndexFamilies(): Promise<IndexFamily[]> {
  return getJson<IndexFamily[]>("/api/index-families");
}

async function main(): Promise<void> {
  console.log("Index Families");
  console.log("=".repeat(80));

  try {
    const families = await getIndexFamilies();

    for (const family of families) {
      console.log(`\n${family.family_name}`);
      console.log(`  ID: ${family.family_id}`);
      console.log(`  Description: ${family.family_description}`);
      console.log(`  Tickers: ${family.family_tickers.join(", ")}`);

      if (family.primary_index) {
        const pi = family.primary_index;
        console.log(`  Primary Index: ${pi.index_name} (${pi.index_id})`);
        console.log(`    Value: ${pi.index_value?.toFixed(2) ?? "N/A"}`);
      }
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error: ${error.message}`);
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
