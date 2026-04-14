/**
 * Request/response shapes for the anera.markets public API (see ../openapi.json at repo root).
 */

export type ResourceType = "token-factory" | "model" | "company";

export type TokenType = "total" | "prompt" | "completion" | "reasoning";

export interface ModelItem {
  model_slug: string;
  model_name: string;
}

export interface TokenFactoryItem {
  provider_slug: string;
  provider_name: string;
}

export interface CompanyItem {
  provider: string;
}

export interface RevenueRow {
  resource_id: string;
  revenue_usd: number;
}

export interface RevenueResponse {
  resource_type: ResourceType;
  /** YYYY-MM-DD date used for the ranking */
  timestamp: string;
  items?: RevenueRow[];
}

export interface TokenUtilisationRow {
  resource_id: string;
  resource_name: string;
  token_count: number;
  /** Rank ordered by highest token usage first */
  rank: number;
}

export interface TokenUtilisationResponse {
  resource_type: ResourceType;
  /** YYYY-MM-DD date used for the ranking */
  timestamp: string;
  token_type: TokenType;
  items?: TokenUtilisationRow[];
}

/** Query string for GET /api/v1/public/revenue/{resource_type} */
export interface RevenueQueryParams {
  timestamp?: string;
  resource_id?: string;
}

/** Query string for GET /api/v1/public/token-utilisation/{resource_type} */
export interface TokenUtilisationQueryParams extends RevenueQueryParams {
  /** Defaults to `total` on the server; sent explicitly here for clarity. */
  token_type?: TokenType;
}
