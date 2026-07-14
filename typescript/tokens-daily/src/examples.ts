/**
 * Example: Get daily token counts.
 *
 * Demonstrates how to fetch the current total token count from the company
 * token utilisation endpoint.
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import { getJson } from "@anera/shared-client";
import { formatNumber, run } from "@anera/shared-client/util";

interface UtilisationItem {
  resource_id: string;
  resource_name: string;
  token_count: number;
}

interface UtilisationResponse {
  resource_type: string;
  timestamp: string;
  token_type: string;
  items: UtilisationItem[];
}

async function main(): Promise<void> {
  console.log("Daily Token Counts");
  console.log("=".repeat(80));

  try {
    const data: UtilisationResponse = await getJson<UtilisationResponse>(
      "/api/v1/token-utilisation/company",
      { token_type: "total" },
    );

    const total = data.items.reduce((sum, item) => sum + item.token_count, 0);

    console.log(`Total tokens ingested: ${formatNumber(total)}`);
    console.log(`As of:                  ${data.timestamp}`);

    if (data.items.length > 0) {
      const top = data.items[0];
      console.log(`Top consumer:           ${top.resource_name} (${formatNumber(top.token_count)} tokens)`);
    } else {
      console.log("No data available");
    }
  } catch (err) {
    const error = err as Error;
    console.error(`Error fetching daily tokens: ${error.message}`);
  }

  console.log("\n" + "=".repeat(80));
}

run(main);