/**
 * Example: Revenue trend analysis for a company over time.
 *
 * This example demonstrates how to track revenue changes for a specific company
 * across multiple days to identify trends.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 * Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
 */

import type { RevenueResponse } from "./types.js";
import { getJson } from "@anera/shared-client";
import { formatUsd, run } from "@anera/shared-client/util";

// Configuration
const COMPANY = "anthropic"; // Company to track (e.g., "anthropic", "openai", "google")
const DAYS = 7; // Number of days to look back

async function getCompanyRevenue(timestamp: string, resourceId: string): Promise<RevenueResponse> {
  return getJson<RevenueResponse>("/api/v1/revenue/company", {
    timestamp,
    resource_id: resourceId,
  });
}

function* dateRange(days: number): Generator<string> {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const current = new Date(end);
    current.setDate(current.getDate() - i);
    yield current.toISOString().split("T")[0];
  }
}

async function main(): Promise<void> {
  console.log(`Revenue Trend for ${COMPANY} (${DAYS} days)`);
  console.log("=".repeat(80));
  console.log(`Date           Revenue (USD)          Change          `);
  console.log("-".repeat(80));

  let prevRevenue: number | undefined;

  for (const timestamp of dateRange(DAYS)) {
    try {
      const data = await getCompanyRevenue(timestamp, COMPANY);
      const items = data.items ?? [];

      if (items.length === 0) {
        console.log(`${timestamp.padEnd(15)}No data`);
        prevRevenue = undefined;
        continue;
      }

      const revenue = items[0].revenue_usd ?? 0;

      // Calculate change from previous day
      let changeStr = "-";
      if (prevRevenue !== undefined && prevRevenue > 0) {
        const changePct = ((revenue - prevRevenue) / prevRevenue) * 100;
        changeStr = `${changePct > 0 ? "+" : ""}${changePct.toFixed(1)}%`;
      }

      console.log(
        `${timestamp.padEnd(15)}${formatUsd(revenue).padStart(23)}${changeStr.padEnd(20)}`,
      );
      prevRevenue = revenue;
    } catch (err) {
      const error = err as Error;
      console.log(`${timestamp.padEnd(15)}Error: ${error.message}`);
      prevRevenue = undefined;
    }
  }

  console.log("=".repeat(80));
}

run(main);