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

async function getTickerHistory(params: TickerQueryParams = {}): Promise<TickerHistoryResponse> {
  const { symbol, startDate, endDate, timePeriod, apiKey } = params;
  const queryParams: Record<string, string | number | undefined> = {};
  if (startDate !== undefined) queryParams.startDate = startDate;
  if (endDate !== undefined) queryParams.endDate = endDate;
  if (timePeriod !== undefined) queryParams.time_period = timePeriod;
  const headers: Record<string, string> = {};
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return getJson<TickerHistoryResponse>(
    `/api/v1/tickers/${encodeURIComponent(symbol!)}`,
    queryParams,
    headers,
  );
}

async function main(): Promise<void> {
  const symbol = "AI-TDI";

  // -- Historical data (explicit date range) ----------------------------------
  console.log(`Historical data for ${symbol} (date range):`);
  console.log("-".repeat(40));
  try {
    const resp = await getTickerHistory({ symbol, startDate: "2026-06-30", endDate: "2026-07-06" });
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

  // -- Custom lookback with time_period (free 7-day window) --------------------
  console.log(`\nLast 4 days for ${symbol} (time_period=4):`);
  console.log("-".repeat(40));
  try {
    const resp = await getTickerHistory({ symbol, timePeriod: 4 });
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

  // -- Shorter lookback -------------------------------------------------------
  console.log(`\nLast 2 days for ${symbol} (time_period=2):`);
  console.log("-".repeat(40));
  try {
    const resp = await getTickerHistory({ symbol, timePeriod: 2 });
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

  // -- Extended lookback (requires API key) -----------------------------------
  console.log(`\nLast 30 days for ${symbol} (time_period=30, requires API key):`);
  console.log("-".repeat(40));
  const apiKey = process.env.ANERA_MARKETS_API_KEY;
  if (!apiKey) {
    console.log("  Skipping: set ANERA_MARKETS_API_KEY to query more than 7 days of history.");
  } else {
    try {
      const resp = await getTickerHistory({ symbol, timePeriod: 30, apiKey });
      const items = resp.items;
      if (items.length === 0) {
        console.log("  No data available");
      } else {
        console.log(`  ${items.length} data points:`);
        console.log(`    First: ${items[0].timestamp}: ${items[0].value.toFixed(2)}`);
        console.log(`    Last:  ${items[items.length - 1].timestamp}: ${items[items.length - 1].value.toFixed(2)}`);
      }
    } catch (err) {
      const error = err as Error;
      console.log(`  Error: ${error.message}`);
    }
  }

  console.log("");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});