/**
 * Example: Get top company revenue per day for a date range.
 *
 * This example demonstrates how to request company revenue data for multiple days
 * and display the top revenue-generating companies for each day in the range.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 * Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
 */

import type { RevenueResponse } from "./types.js";
import { getJson } from "@anera/shared-client";
import { formatDate, formatUsd, run } from "@anera/shared-client/util";

// Configure the date range here (dynamic, like Python)
const today = new Date();
const START_DATE = new Date(today);
START_DATE.setDate(today.getDate() - 7);
const END_DATE = today;
const TOP_N = 10; // Number of top companies to display per day

async function getCompanyRevenue(timestamp?: string): Promise<RevenueResponse> {
  const params: Record<string, string | undefined> = {};
  if (timestamp) params.timestamp = timestamp;
  return getJson<RevenueResponse>("/api/v1/revenue/company", params);
}

function* dateRange(start: Date, end: Date): Generator<Date> {
  const current = new Date(start);
  while (current <= end) {
    yield new Date(current);
    current.setDate(current.getDate() + 1);
  }
}

async function main(): Promise<void> {
  const dates = Array.from(dateRange(START_DATE, END_DATE));

  console.log(`Company Revenue Rankings (${formatDate(START_DATE)} to ${formatDate(END_DATE)})`);
  console.log("=".repeat(80));

  for (const currentDate of dates) {
    const timestamp = formatDate(currentDate);

    console.log(`\n${timestamp}:`);
    console.log("-".repeat(40));

    try {
      const data = await getCompanyRevenue(timestamp);
      const items = data.items ?? [];

      if (items.length === 0) {
        console.log("  No data available for this date");
        continue;
      }

      // Display top N companies
      for (let i = 0; i < Math.min(TOP_N, items.length); i++) {
        const item = items[i];
        const company = item.resource_id ?? "Unknown";
        console.log(`  ${String(i + 1).padStart(2, " ")}. ${company}: ${formatUsd(item.revenue_usd ?? 0)}`);
      }
    } catch (err) {
      const error = err as Error & { response?: { status: number; text?: string } };
      console.log(`  Error fetching data: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

run(main);