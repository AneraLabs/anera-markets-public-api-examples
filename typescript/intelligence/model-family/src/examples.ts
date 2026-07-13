/**
 * Example: Model family intelligence.
 *
 * Demonstrates how to fetch model family rankings, daily revenue, family overviews,
 * summaries, per-model revenue breakdowns, and model rankings within families.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  DailyRevenuePerModelResponse,
  DailyRevenueResponse,
  ModelFamilyOverview,
  ModelFamilyRankingResponse,
  ModelFamilySummaryResponse,
  ModelRankingResponse,
} from "./types.js";
import { getJson } from "./client.js";

async function getDailyRevenue(days: number): Promise<DailyRevenueResponse> {
  return getJson<DailyRevenueResponse>("/api/v1/intelligence/model-family/daily-revenue", { days });
}

async function getRankings(days: number, metric: string, limit?: number): Promise<ModelFamilyRankingResponse> {
  const params: Record<string, string | number> = { days, metric };
  if (limit !== undefined) params.limit = limit;
  return getJson<ModelFamilyRankingResponse>("/api/v1/intelligence/model-family/rankings", params);
}

async function getFamilyOverview(familyId: string): Promise<ModelFamilyOverview> {
  return getJson<ModelFamilyOverview>(`/api/v1/intelligence/model-family/family/${encodeURIComponent(familyId)}`);
}

async function getFamilySummary(familyId: string, days: number): Promise<ModelFamilySummaryResponse> {
  return getJson<ModelFamilySummaryResponse>(
    `/api/v1/intelligence/model-family/family/${encodeURIComponent(familyId)}/summary`,
    { days },
  );
}

async function getDailyRevenuePerModel(familyId: string, days: number): Promise<DailyRevenuePerModelResponse> {
  return getJson<DailyRevenuePerModelResponse>(
    `/api/v1/intelligence/model-family/family/${encodeURIComponent(familyId)}/breakdown/daily-revenue-per-model`,
    { days },
  );
}

async function getModelRankings(
  familyId: string,
  metric: "revenue" | "tokens" = "revenue",
): Promise<ModelRankingResponse> {
  return getJson<ModelRankingResponse>(
    `/api/v1/intelligence/model-family/family/${encodeURIComponent(familyId)}/breakdown/model-rankings`,
    { metric },
  );
}

async function main(): Promise<void> {
  console.log("Model Family Intelligence");
  console.log("=".repeat(80));

  // -- Rankings ----------------------------------------------------------------
  console.log("\nModel Family Rankings (30d, by revenue):");
  console.log("-".repeat(40));
  let topFamilyId = "";
  try {
    const rankings = await getRankings(30, "revenue", 10);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.family_name.padEnd(20)} $${row.revenue_usd.toFixed(2).padStart(12)}  ${row.token_count} tokens`,
      );
    }
    if (rankings.rows.length > 0) {
      topFamilyId = rankings.rows[0].family_id;
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
  if (topFamilyId) {
    console.log(`\nFamily Overview (${topFamilyId}):`);
    console.log("-".repeat(40));
    try {
      const overview = await getFamilyOverview(topFamilyId);
      console.log(`  Name: ${overview.family_name}`);
      console.log(`  Description: ${overview.description}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Family summary ---------------------------------------------------------
    console.log(`\nFamily Summary (${topFamilyId}, 30d):`);
    console.log("-".repeat(40));
    try {
      const summary = await getFamilySummary(topFamilyId, 30);
      console.log(`  Period: ${summary.from_date} to ${summary.to_date}`);
      console.log(`  Models supported: ${summary.models_supported_period}`);
      console.log(`  Revenue: $${summary.revenue_usd_period.toFixed(2)}`);
      console.log(`  Revenue stddev: $${summary.revenue_stddev_usd_period.toFixed(2)}`);
      console.log(`  Gross profit: ${summary.gross_profit_usd_period != null ? `$${summary.gross_profit_usd_period.toFixed(2)}` : "N/A"}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Daily revenue per model ------------------------------------------------
    console.log(`\nDaily Revenue Per Model (${topFamilyId}, 7d):`);
    console.log("-".repeat(40));
    try {
      const data = await getDailyRevenuePerModel(topFamilyId, 7);
      for (const entry of data.data.slice(-3)) {
        console.log(`  ${entry.date}: ${entry.models.length} models`);
        const top = entry.models.sort((a, b) => b.revenue_usd - a.revenue_usd)[0];
        if (top) {
          console.log(`    Top: ${top.model_name} ($${top.revenue_usd.toFixed(2)})`);
        }
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Model rankings within family -------------------------------------------
    console.log(`\nModel Rankings (${topFamilyId}):`);
    console.log("-".repeat(40));
    try {
      const rankings = await getModelRankings(topFamilyId, "revenue");
      for (const row of rankings.rows) {
        console.log(
          `  ${row.rank}. ${row.model_name.padEnd(30)} $${row.revenue_usd.toFixed(2).padStart(12)}  ${row.token_count} tokens`,
        );
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
