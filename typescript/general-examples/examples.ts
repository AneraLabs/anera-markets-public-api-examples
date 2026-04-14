/**
 * Typed example calls to the anera.markets public HTTP API (Node 18+ fetch).
 *
 * Set ANERA_MARKETS_API_BASE_URL to your API origin (scheme + host, no trailing slash).
 */

import type {
  CompanyItem,
  ModelItem,
  ResourceType,
  RevenueQueryParams,
  RevenueResponse,
  TokenFactoryItem,
  TokenUtilisationQueryParams,
  TokenUtilisationResponse,
} from "./types.js";

export type {
  CompanyItem,
  ModelItem,
  ResourceType,
  RevenueQueryParams,
  RevenueResponse,
  RevenueRow,
  TokenFactoryItem,
  TokenType,
  TokenUtilisationQueryParams,
  TokenUtilisationResponse,
  TokenUtilisationRow,
} from "./types.js";

function baseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "").trim().replace(/\/$/, "");
  if (!base) {
    console.error(
      "Set ANERA_MARKETS_API_BASE_URL to the API origin, e.g. ANERA_MARKETS_API_BASE_URL=https://api.example.com",
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

export function getModels(): Promise<ModelItem[]> {
  return getJson<ModelItem[]>("/api/v1/public/models");
}

export function getTokenFactories(): Promise<TokenFactoryItem[]> {
  return getJson<TokenFactoryItem[]>("/api/v1/public/token-factories");
}

export function getCompanies(): Promise<CompanyItem[]> {
  return getJson<CompanyItem[]>("/api/v1/public/companies");
}

export function getRevenue(
  resourceType: ResourceType,
  params: RevenueQueryParams = {},
): Promise<RevenueResponse> {
  const { timestamp, resource_id: resourceId } = params;
  return getJson<RevenueResponse>(`/api/v1/public/revenue/${resourceType}`, {
    ...(timestamp !== undefined ? { timestamp } : {}),
    ...(resourceId !== undefined ? { resource_id: resourceId } : {}),
  });
}

export function getTokenUtilisation(
  resourceType: ResourceType,
  params: TokenUtilisationQueryParams = {},
): Promise<TokenUtilisationResponse> {
  const {
    timestamp,
    resource_id: resourceId,
    token_type: tokenType = "total",
  } = params;
  return getJson<TokenUtilisationResponse>(`/api/v1/public/token-utilisation/${resourceType}`, {
    token_type: tokenType,
    ...(timestamp !== undefined ? { timestamp } : {}),
    ...(resourceId !== undefined ? { resource_id: resourceId } : {}),
  });
}

async function main(): Promise<void> {
  console.log("Models (first 3):");
  const models = await getModels();
  console.log(JSON.stringify(models.slice(0, 3), null, 2));

  console.log("\nToken factories (first 3):");
  const factories = await getTokenFactories();
  console.log(JSON.stringify(factories.slice(0, 3), null, 2));

  console.log("\nCompanies (first 3):");
  const companies = await getCompanies();
  console.log(JSON.stringify(companies.slice(0, 3), null, 2));

  console.log("\nRevenue by model (latest day, sample):");
  const revenue = await getRevenue("model");
  console.log(
    JSON.stringify(
      {
        resource_type: revenue.resource_type,
        timestamp: revenue.timestamp,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify((revenue.items ?? []).slice(0, 5), null, 2));

  console.log("\nToken utilisation by company (total, latest day, sample):");
  const util = await getTokenUtilisation("company", { token_type: "total" });
  console.log(
    JSON.stringify(
      {
        resource_type: util.resource_type,
        timestamp: util.timestamp,
        token_type: util.token_type,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify((util.items ?? []).slice(0, 5), null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
