/**
 * Example: Get daily token counts.
 *
 * Demonstrates how to fetch the current total token count and previous-day delta
 * using the anera.markets API.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type { DailyTokensResponse } from "./types.js";
import { getJson } from "./client.js";

export async function getDailyTokens(): Promise<DailyTokensResponse> {
  return getJson<DailyTokensResponse>("/api/tokens/daily");
}

function formatNumber(numStr: string | null): string {
  if (!numStr || numStr === "None") return "N/A";
  const num = parseInt(numStr, 10);
  if (isNaN(num)) return "N/A";
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  return num.toLocaleString();
}

async function main(): Promise<void> {
  console.log("Daily Token Counts");
  console.log("=".repeat(80));

  try {
    const data = await getDailyTokens();

    console.log(`Total tokens ingested: ${formatNumber(data.totalCount)}`);
    console.log(`Previous day delta:    ${formatNumber(data.delta)}`);
    console.log(`Last updated:          ${data.lastUpdated}`);

    if (data.delta && data.delta !== "None") {
      const perSecond = parseFloat(data.delta) / 86400;
      console.log(`Approx. tokens/sec:    ${perSecond.toFixed(0).toLocaleString()}`);
    } else {
      console.log(`Approx. tokens/sec:    N/A`);
    }
  } catch (err) {
    console.error(`Error fetching daily tokens: ${(err as Error).message}`);
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
