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

// Configuration
const COMPANY = "anthropic"; // Company to track (e.g., "anthropic", "openai", "google")
const DAYS = 7; // Number of days to look back

function baseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "").trim().replace(/\/$/, "");
  if (!base) {
    console.error(
      "Set ANERA_MARKETS_API_BASE_URL to the API origin, e.g. " +
        "ANERA_MARKETS_API_BASE_URL=https://api.example.com",
    );
    process.exit(1);
  }
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

async function getCompanyRevenue(timestamp: string, resourceId: string): Promise<RevenueResponse> {
  return getJson<RevenueResponse>("/api/v1/public/revenue/company", {
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
        `${timestamp.padEnd(15)}$${revenue
          .toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .padStart(23)}${changeStr.padEnd(20)}`,
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

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
