/**
 * Request/response shapes for the anera.markets public API (see ../../openapi.json at repo root).
 */

export type TokenType = "total" | "prompt" | "completion" | "reasoning";

export interface TokenUtilisationRow {
  resource_id: string;
  resource_name: string;
  token_count: number;
  rank: number;
}

export interface TokenUtilisationResponse {
  resource_type: "company";
  timestamp: string;
  token_type: TokenType;
  items?: TokenUtilisationRow[];
}
