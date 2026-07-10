/**
 * Example: Get ticker values.
 *
 * Demonstrates how to fetch historical ticker data for a symbol
 * using the anera.markets API.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type { TickerHistoryResponse, TickerQueryParams } from "./types.js";
import { getJson } from "./client.js";

async function getTickerHistory(symbol: string, params: TickerQueryParams = {}): Promise<TickerHistoryResponse> {
  const { startDate, endDate } = params;
  const queryParams: Record<string, string> = {};
  if (startDate !== undefined) queryParams.startDate = startDate;
  if (endDate !== undefined) queryParams.endDate = endDate;
  return getJson<TickerHistoryResponse>(`/api/v1/tickers/${encodeURIComponent(symbol)}`, queryParams);
}

async function main(): Promise<void> {
  const symbol = "AI-TDI";

  // -- Historical data (explicit date range) ----------------------------------
  console.log(`Historical data for ${symbol} (date range):`);
  console.log("-".repeat(40));
  try {
    const resp = await getTickerHistory(symbol, { startDate: "2026-06-30", endDate: "2026-07-06" });
    const items = resp.items;
    if (items.length === 0) {
      console.log("  No data available for this range");
    } else {
      console.log(`  ${items.length} data points:`);
      for (const pt of items) {
        console.log(`    ${pt.timestamp}: ${pt.value.toFixed(2)}`);
      }
    }
  } catch (err) {
    const error = err as Error;
    console.log(`  Error: ${error.message}`);
  }

  // -- Default (last 30 days) -------------------------------------------------
  console.log(`\nRecent data for ${symbol} (default 30 days):`);
  console.log("-".repeat(40));
  try {
    const resp = await getTickerHistory(symbol);
    const items = resp.items;
    if (items.length === 0) {
      console.log("  No data available");
    } else {
      console.log(`  ${items.length} data points:`);
      for (const pt of items) {
        console.log(`    ${pt.timestamp}: ${pt.value.toFixed(2)}`);
      }
    }
  } catch (err) {
    const error = err as Error;
    console.log(`  Error: ${error.message}`);
  }

  console.log("");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
