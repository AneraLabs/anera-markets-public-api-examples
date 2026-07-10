/**
 * Example: Get token utilisation by token type for companies.
 *
 * This example demonstrates how to request token utilisation data for different
 * token types (total, prompt, completion, reasoning) and display the top
 * token-consuming companies for each type.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 * Example: export ANERA_MARKETS_API_BASE_URL=https://api.anera.markets
 */

import type { TokenType, TokenUtilisationResponse } from "./types.js";
import { getJson } from "./client.js";

// Configure the token types to display
const TOKEN_TYPES: TokenType[] = ["total", "prompt", "completion", "reasoning"];
const TOP_N = 10; // Number of top companies to display per token type
const TIMESTAMP = undefined; // Optional: specific date (omit for latest available)

async function getTokenUtilisation(tokenType: TokenType, timestamp?: string): Promise<TokenUtilisationResponse> {
  const params: Record<string, string | undefined> = { token_type: tokenType };
  if (timestamp) params.timestamp = timestamp;
  return getJson<TokenUtilisationResponse>("/api/v1/token-utilisation/company", params);
}

function formatTokens(count: number): string {
  if (count >= 1e12) return `${(count / 1e12).toFixed(2)}T`;
  if (count >= 1e9) return `${(count / 1e9).toFixed(2)}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(2)}M`;
  return count.toLocaleString();
}

async function main(): Promise<void> {
  console.log(`Token Utilisation by Type (Date: ${TIMESTAMP ?? "Latest"})`);
  console.log("=".repeat(80));

  for (const tokenType of TOKEN_TYPES) {
    console.log(`\n${tokenType.toUpperCase()}:`);
    console.log("-".repeat(40));

    try {
      const data = await getTokenUtilisation(tokenType, TIMESTAMP);
      const items = data.items ?? [];

      if (items.length === 0) {
        console.log("  No data available for this token type");
        continue;
      }

      // Display top N companies
      for (let i = 0; i < Math.min(TOP_N, items.length); i++) {
        const item = items[i];
        const tokenCount = item.token_count ?? 0;
        const company = item.resource_id ?? "Unknown";
        const formatted = formatTokens(tokenCount);
        console.log(`  ${String(i + 1).padStart(2, " ")}. ${company}: ${formatted} tokens`);
      }
    } catch (err) {
      const error = err as Error;
      console.log(`  Error fetching data: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
