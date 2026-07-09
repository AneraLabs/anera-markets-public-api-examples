/**
 * Example: Token factory intelligence endpoints.
 *
 * Demonstrates how to fetch token factory analytics including daily revenue,
 * rankings, summaries, and per-model breakdowns.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  DailyRevenueResponse,
  ModelRankingResponse,
  TokenFactoryOverview,
  TokenFactoryRankingResponse,
} from "./types.js";
import { getJson } from "./client.js";

async function getDailyRevenue(days: number): Promise<DailyRevenueResponse> {
  return getJson<DailyRevenueResponse>("/api/intelligence/token-factory/daily-revenue", { days });
}

async function getRankings(metric: "revenue" | "utilisation" = "revenue", limit = 20): Promise<TokenFactoryRankingResponse> {
  return getJson<TokenFactoryRankingResponse>("/api/intelligence/token-factory/rankings", { metric, limit });
}

async function getFactoryOverview(factoryId: string): Promise<TokenFactoryOverview> {
  return getJson<TokenFactoryOverview>(`/api/intelligence/token-factory/factory/${encodeURIComponent(factoryId)}`);
}

async function getModelRankings(factoryId: string, metric: "revenue" | "tokens" = "revenue"): Promise<ModelRankingResponse> {
  return getJson<ModelRankingResponse>(
    `/api/intelligence/token-factory/factory/${encodeURIComponent(factoryId)}/breakdown/model-rankings`,
    { metric },
  );
}

async function main(): Promise<void> {
  console.log("Token Factory Intelligence");
  console.log("=".repeat(80));

  // -- Rankings ----------------------------------------------------------------
  console.log("\nFactory Rankings (by revenue):");
  console.log("-".repeat(40));
  try {
    const rankings = await getRankings("revenue", 5);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.factory_name}: $${row.revenue_usd.toFixed(2)} (${row.token_utilisation} tokens)`,
      );
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Daily revenue -----------------------------------------------------------
  console.log("\nDaily Revenue (7 days):");
  console.log("-".repeat(40));
  try {
    const data = await getDailyRevenue(7);
    for (const entry of data.data.slice(-3)) {
      console.log(`  ${entry.date}: ${entry.factories.length} factories`);
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
