/**
 * Example: Get top models by revenue.
 *
 * This example demonstrates how to request model revenue data and display the
 * top revenue-generating models with their rankings.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 * Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
 */

import type { RevenueResponse } from "./types.js";
import { getJson } from "./client.js";

// Configuration
const TOP_N = 20; // Number of top models to display
const TIMESTAMP: string | undefined = undefined; // Set to "YYYY-MM-DD" for specific date, or undefined for latest

async function getModelRevenue(timestamp?: string): Promise<RevenueResponse> {
  const params: Record<string, string | undefined> = {};
  if (timestamp) params.timestamp = timestamp;
  return getJson<RevenueResponse>("/api/v1/public/revenue/model", params);
}

async function main(): Promise<void> {
  const data = await getModelRevenue(TIMESTAMP);
  const items = data.items ?? [];
  const timestamp = data.timestamp ?? "Latest";

  console.log(`Top Models by Revenue (${timestamp})`);
  console.log("=".repeat(80));
  console.log(`Rank  Model                                                  Revenue (USD)`);
  console.log("-".repeat(80));

  for (let i = 0; i < Math.min(TOP_N, items.length); i++) {
    const item = items[i];
    const model = (item.resource_id ?? "Unknown").substring(0, 50);
    const revenue = item.revenue_usd ?? 0;
    const revenueStr = `$${revenue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    console.log(`${String(i + 1).padStart(6)} ${model.padEnd(50)} ${revenueStr.padStart(23)}`);
  }

  console.log("=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
