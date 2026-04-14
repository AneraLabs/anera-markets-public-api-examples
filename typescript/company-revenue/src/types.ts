/**
 * Request/response shapes for the anera.markets public API (see ../../openapi.json at repo root).
 */

export type ResourceType = "token-factory" | "model" | "company";

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
