/**
 * Example: Model intelligence endpoints.
 *
 * Demonstrates how to fetch model analytics including daily revenue per model,
 * rankings, summaries, revenue by factory, and token ratios.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  DailyRevenueByFactoryResponse,
  DailyRevenuePerModelResponse,
  DailyTokenRatioResponse,
  ModelOverview,
  ModelRankingResponse,
  ModelSummaryResponse,
} from "./types.js";
import { getJson } from "./client.js";

async function getDailyRevenuePerModel(days: number): Promise<DailyRevenuePerModelResponse> {
  return getJson<DailyRevenuePerModelResponse>("/api/intelligence/models/daily-revenue-per-model", { days });
}

async function getRankings(
  days: number,
  metric: "revenue" | "tokens" = "revenue",
  limit = 20,
): Promise<ModelRankingResponse> {
  return getJson<ModelRankingResponse>("/api/intelligence/models/rankings", { days, metric, limit });
}

async function getModelOverview(modelId: string): Promise<ModelOverview> {
  return getJson<ModelOverview>(`/api/intelligence/models/model/${encodeURIComponent(modelId)}`);
}

async function getModelSummary(modelId: string, days: number): Promise<ModelSummaryResponse> {
  return getJson<ModelSummaryResponse>(
    `/api/intelligence/models/model/${encodeURIComponent(modelId)}/summary`,
    { days },
  );
}

async function getDailyRevenueByFactory(modelId: string, days: number): Promise<DailyRevenueByFactoryResponse> {
  return getJson<DailyRevenueByFactoryResponse>(
    `/api/intelligence/models/model/${encodeURIComponent(modelId)}/breakdown/daily-revenue-by-token-factory`,
    { days },
  );
}

async function getDailyTokenRatio(modelId: string, days: number): Promise<DailyTokenRatioResponse> {
  return getJson<DailyTokenRatioResponse>(
    `/api/intelligence/models/model/${encodeURIComponent(modelId)}/breakdown/daily-token-ratio`,
    { days },
  );
}

async function main(): Promise<void> {
  console.log("Model Intelligence");
  console.log("=".repeat(80));

  // -- Rankings ----------------------------------------------------------------
  console.log("\nModel Rankings (30d, by revenue):");
  console.log("-".repeat(40));
  try {
    const rankings = await getRankings(30, "revenue", 5);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.model_name.padEnd(30)} $${row.revenue_usd.toFixed(2).padStart(12)}  ${row.token_count} tokens`,
      );
    }
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
  }

  // -- Daily revenue per model --------------------------------------------------
  console.log("\nDaily Revenue Per Model (7d):");
  console.log("-".repeat(40));
  try {
    const data = await getDailyRevenuePerModel(7);
    for (const entry of data.data.slice(-3)) {
      const top = entry.models.sort((a, b) => b.revenue_usd - a.revenue_usd)[0];
      console.log(`  ${entry.date}: ${entry.models.length} models (top: ${top?.model_name})`);
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
