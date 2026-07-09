/**
 * Example: Model family intelligence.
 *
 * Demonstrates how to fetch model family rankings, daily revenue, and
 * detailed breakdowns for a specific family.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  DailyRevenueResponse,
  ModelFamilyOverview,
  ModelFamilyRankingResponse,
} from "./types.js";
import { getJson } from "./client.js";

async function getDailyRevenue(days: number): Promise<DailyRevenueResponse> {
  return getJson<DailyRevenueResponse>("/api/intelligence/model-family/daily-revenue", { days });
}

async function getRankings(days: number, metric: string, limit?: number): Promise<ModelFamilyRankingResponse> {
  const params: Record<string, string | number> = { days, metric };
  if (limit !== undefined) params.limit = limit;
  return getJson<ModelFamilyRankingResponse>("/api/intelligence/model-family/rankings", params);
}

async function getFamilyOverview(familyId: string): Promise<ModelFamilyOverview> {
  return getJson<ModelFamilyOverview>(`/api/intelligence/model-family/family/${encodeURIComponent(familyId)}`);
}

async function main(): Promise<void> {
  console.log("Model Family Intelligence");
  console.log("=".repeat(80));

  // -- Rankings ----------------------------------------------------------------
  console.log("\nModel Family Rankings (30d, by revenue):");
  console.log("-".repeat(40));
  try {
    const rankings = await getRankings(30, "revenue", 10);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.family_name.padEnd(20)} $${row.revenue_usd.toFixed(2).padStart(12)}  ${row.token_count} tokens`,
      );
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Daily revenue -----------------------------------------------------------
  console.log("\nDaily Revenue (7d):");
  console.log("-".repeat(40));
  try {
    const data = await getDailyRevenue(7);
    for (const entry of data.data) {
      const total = entry.families.reduce((sum, f) => sum + f.revenue_usd, 0);
      console.log(`  ${entry.date}: $${total.toFixed(2)} (${entry.families.length} families)`);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Family overview ---------------------------------------------------------
  console.log("\nFamily Overview (openai):");
  console.log("-".repeat(40));
  try {
    const overview = await getFamilyOverview("openai");
    console.log(`  ${overview.family_name}: ${overview.description}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
