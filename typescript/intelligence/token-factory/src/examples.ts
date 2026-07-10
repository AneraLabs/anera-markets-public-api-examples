/**
 * Example: Token factory intelligence endpoints.
 *
 * Demonstrates how to fetch token factory analytics including daily revenue,
 * rankings, factory overviews, summaries, per-model revenue breakdowns,
 * and model rankings within factories.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  DailyRevenuePerModelResponse,
  DailyRevenueResponse,
  ModelRankingResponse,
  TokenFactoryOverview,
  TokenFactoryRankingResponse,
  TokenFactorySummaryResponse,
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

async function getFactorySummary(factoryId: string, days: number): Promise<TokenFactorySummaryResponse> {
  return getJson<TokenFactorySummaryResponse>(
    `/api/intelligence/token-factory/factory/${encodeURIComponent(factoryId)}/summary`,
    { days },
  );
}

async function getDailyRevenuePerModel(factoryId: string, days: number): Promise<DailyRevenuePerModelResponse> {
  return getJson<DailyRevenuePerModelResponse>(
    `/api/intelligence/token-factory/factory/${encodeURIComponent(factoryId)}/breakdown/daily-revenue-per-model`,
    { days },
  );
}

async function getModelRankings(
  factoryId: string,
  metric: "revenue" | "tokens" = "revenue",
): Promise<ModelRankingResponse> {
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
  let topFactoryId = "";
  try {
    const rankings = await getRankings("revenue", 5);
    for (const row of rankings.rows) {
      console.log(
        `  ${row.rank}. ${row.factory_name}: $${row.revenue_usd.toFixed(2)} (${row.token_utilisation} tokens)`,
      );
    }
    if (rankings.rows.length > 0) {
      topFactoryId = rankings.rows[0].factory_id;
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

  // -- Factory overview --------------------------------------------------------
  if (topFactoryId) {
    console.log(`\nFactory Overview (${topFactoryId}):`);
    console.log("-".repeat(40));
    try {
      const overview = await getFactoryOverview(topFactoryId);
      console.log(`  Name: ${overview.factory_name}`);
      console.log(`  Description: ${overview.description}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Factory summary -------------------------------------------------------
    console.log(`\nFactory Summary (${topFactoryId}, 30d):`);
    console.log("-".repeat(40));
    try {
      const summary = await getFactorySummary(topFactoryId, 30);
      console.log(`  Period: ${summary.from_date} to ${summary.to_date}`);
      console.log(`  Models supported: ${summary.models_supported_period}`);
      console.log(`  Revenue: $${summary.revenue_usd_period.toFixed(2)}`);
      console.log(`  Revenue stddev: $${summary.revenue_stddev_usd_period.toFixed(2)}`);
      console.log(`  Gross profit: ${summary.gross_profit_usd_period != null ? `$${summary.gross_profit_usd_period.toFixed(2)}` : "N/A"}`);
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
    }

    // -- Daily revenue per model -----------------------------------------------
    console.log(`\nDaily Revenue Per Model (${topFactoryId}, 7d):`);
    console.log("-".repeat(40));
    try {
      const data = await getDailyRevenuePerModel(topFactoryId, 7);
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

    // -- Model rankings within factory ------------------------------------------
    console.log(`\nModel Rankings (${topFactoryId}):`);
    console.log("-".repeat(40));
    try {
      const rankings = await getModelRankings(topFactoryId, "revenue");
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
