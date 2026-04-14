/**
 * Request/response shapes for the anera.markets public API (see ../../openapi.json at repo root).
 */

export interface RevenueRow {
  resource_id: string;
  revenue_usd: number;
}

export interface RevenueResponse {
  resource_type: "company";
  timestamp: string;
  items?: RevenueRow[];
}
