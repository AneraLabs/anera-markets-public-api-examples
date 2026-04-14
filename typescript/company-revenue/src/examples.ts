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

// Configure the date range here
const START_DATE = new Date("2026-04-10");
const END_DATE = new Date("2026-04-14");
const TOP_N = 10; // Number of top companies to display per day

function baseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "https://api.anera.markets").trim().replace(/\/$/, "");
  return base;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

async function getJson<T>(path: string, params: Record<string, string | undefined> = {}): Promise<T> {
  const url = `${baseUrl()}${path}${buildQuery(params)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

async function getCompanyRevenue(timestamp?: string): Promise<RevenueResponse> {
  const params: Record<string, string | undefined> = {};
  if (timestamp) params.timestamp = timestamp;
  return getJson<RevenueResponse>("/api/v1/public/revenue/company", params);
}

function* dateRange(start: Date, end: Date): Generator<Date> {
  const current = new Date(start);
  while (current <= end) {
    yield new Date(current);
    current.setDate(current.getDate() + 1);
  }
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
        const revenue = item.revenue_usd ?? 0;
        const company = item.resource_id ?? "Unknown";
        console.log(
          `  ${String(i + 1).padStart(2, " ")}. ${company}: $${revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
        );
      }
    } catch (err) {
      const error = err as Error & { response?: { status: number; text?: string } };
      console.log(`  Error fetching data: ${error.message}`);
    }
  }
  
  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
