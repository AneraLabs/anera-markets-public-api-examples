/**
 * Example: Fetch market indices.
 *
 * Demonstrates how to list all indices, get summary stats, and fetch
 * details for a single index.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type { MarketDataResponse, MarketIndex, IndicesSummaryResponse } from "./types.js";
import { getJson } from "./client.js";

async function getAllIndices(featured?: boolean): Promise<MarketDataResponse> {
  const params: Record<string, string> = {};
  if (featured !== undefined) params.featured = String(featured);
  return getJson<MarketDataResponse>("/api/v1/indices", params);
}

async function getIndicesSummary(): Promise<IndicesSummaryResponse> {
  return getJson<IndicesSummaryResponse>("/api/v1/indices/summary");
}

async function getIndexById(indexId: string): Promise<MarketIndex> {
  return getJson<MarketIndex>(`/api/v1/indices/${encodeURIComponent(indexId)}`);
}

async function main(): Promise<void> {
  console.log("Market Indices");
  console.log("=".repeat(80));

  // -- Featured indices --------------------------------------------------------
  console.log("\nFeatured indices:");
  console.log("-".repeat(40));
  try {
    const data = await getAllIndices(true);
    console.log(`Last updated: ${data.lastUpdated}`);
    for (const idx of data.indices) {
      console.log(`  ${idx.symbol} - ${idx.name}`);
      console.log(`    Value: ${idx.value.toFixed(2)} ${idx.currency}`);
      console.log(`    Change (1D/1W/1M/3M): ${idx.changeDay}% / ${idx.changeWeek}% / ${idx.changeMonth}% / ${idx.change3Month}%`);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Summary -----------------------------------------------------------------
  console.log("\nSummary:");
  console.log("-".repeat(40));
  try {
    const summary = await getIndicesSummary();
    console.log(`  Models count: ${summary.models_count}`);
    console.log(`  Token spend: ${summary.token_spend}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Single index detail -----------------------------------------------------
  console.log("\nSingle index detail (example):");
  console.log("-".repeat(40));
  try {
    const idx = await getIndexById("actdi-v3-core-index");
    console.log(`  ${idx.name} (${idx.symbol})`);
    console.log(`  Description: ${idx.description.substring(0, 100)}...`);
    console.log(`  Group: ${idx.group?.name ?? "N/A"}`);
    console.log(`  Featured: ${idx.featured}`);
    console.log(`  Start date: ${idx.startDate}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
