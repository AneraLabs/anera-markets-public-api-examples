/**
 * Example: Model intelligence endpoints.
 *
 * Demonstrates how to fetch model analytics including daily revenue per model,
 * rankings, model overviews, summaries, revenue by factory, and token ratios.
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
import { getJson } from "@anera/shared-client";
import { run } from "@anera/shared-client/util";

async function getDailyRevenuePerModel(days: number): Promise<DailyRevenuePerModelResponse> {
  return getJson<DailyRevenuePerModelResponse>("/api/v1/intelligence/models/daily-revenue-per-model", { days });
}

async function getRankings(
  days: number,
  metric: "revenue" | "tokens" = "revenue",
  limit = 20,
): Promise<ModelRankingResponse> {
  return getJson<ModelRankingResponse>("/api/v1/intelligence/models/rankings", { days, metric, limit });
}

async function getModelOverview(modelId: string): Promise<ModelOverview> {
  return getJson<ModelOverview>(`/api/v1/intelligence/models/model/${encodeURIComponent(modelId)}`);
}

async function getModelSummary(modelId: string, days: number): Promise<ModelSummaryResponse> {
  return getJson<ModelSummaryResponse>(
    `/api/v1/intelligence/models/model/${encodeURIComponent(modelId)}/summary`,
    { days },
  );
}

async function getDailyRevenueByFactory(modelId: string, days: number): Promise<DailyRevenueByFactoryResponse> {
  return getJson<DailyRevenueByFactoryResponse>(
    `/api/v1/intelligence/models/model/${encodeURIComponent(modelId)}/breakdown/daily-revenue-by-token-factory`,
    { days },
  );
}

async function getDailyTokenRatio(modelId: string, days: number): Promise<DailyTokenRatioResponse> {
  return getJson<DailyTokenRatioResponse>(
    `/api/v1/intelligence/models/model/${encodeURIComponent(modelId)}/breakdown/daily-token-ratio`,
    { days },
  );
}

async function main(): Promise<void> {
  console.log("Model Intelligence");
  console.log("=".repeat(80));

  // -- Rankings ----------------------------------------------------------------
  console.log("\nModel Rankings (30d, by revenue):");
  console.log("-".repeat(40));
  let topModelId = "";
  try {
    const rankings = await getRankings(30, "revenue", 5);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.model_name.padEnd(30)} $${row.revenue_usd.toFixed(2).padStart(12)}  ${row.token_count} tokens`,
      );
    }
    if (rankings.rows.length > 0) {
      topModelId = rankings.rows[0].model_id;
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

  // -- Model overview -----------------------------------------------------------
  if (topModelId) {
    console.log(`\nModel Overview (${topModelId}):`);
    console.log("-".repeat(40));
    try {
      const overview = await getModelOverview(topModelId);
      console.log(`  Name: ${overview.model_name}`);
      console.log(`  Description: ${overview.description.substring(0, 100)}...`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Model summary ----------------------------------------------------------
    console.log(`\nModel Summary (${topModelId}, 30d):`);
    console.log("-".repeat(40));
    try {
      const summary = await getModelSummary(topModelId, 30);
      console.log(`  Period: ${summary.from_date} to ${summary.to_date}`);
      console.log(`  Avg input/output ratio: ${summary.avg_input_output_ratio_period.toFixed(2)}`);
      console.log(`  Revenue: $${summary.revenue_usd_period.toFixed(2)}`);
      console.log(`  Revenue stddev: $${summary.revenue_stddev_usd_period.toFixed(2)}`);
      console.log(`  Total tokens: ${summary.total_tokens_period}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Daily revenue by factory -----------------------------------------------
    console.log(`\nDaily Revenue by Factory (${topModelId}, 7d):`);
    console.log("-".repeat(40));
    try {
      const data = await getDailyRevenueByFactory(topModelId, 7);
      for (const entry of data.data.slice(-3)) {
        console.log(`  ${entry.date}:`);
        for (const factory of entry.factories.slice(0, 3)) {
          console.log(`    ${factory.factory_name}: $${factory.revenue_usd.toFixed(2)} (${factory.token_count} tokens)`);
        }
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Daily token ratio ------------------------------------------------------
    console.log(`\nDaily Token Ratio (${topModelId}, 7d):`);
    console.log("-".repeat(40));
    try {
      const data = await getDailyTokenRatio(topModelId, 7);
      for (const point of data.data.slice(-3)) {
        console.log(
          `  ${point.date}: prompt=${point.prompt_tokens}, completion=${point.completion_tokens}, ` +
          `reasoning=${point.reasoning_tokens}, ratio=${point.input_output_ratio.toFixed(2)}`,
        );
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

run(main);