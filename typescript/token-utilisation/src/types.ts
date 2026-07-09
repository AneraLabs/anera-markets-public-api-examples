/**
 * Request/response shapes for the anera.markets public API (see ../../openapi.json at repo root).
 */

export type ResourceType = "token-factory" | "model" | "company";
export type TokenType = "total" | "prompt" | "completion" | "reasoning";

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
