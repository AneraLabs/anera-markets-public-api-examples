/**
 * Request/response shapes for the index families endpoint.
 *
 * GET /api/v1/index-families
 */

export interface PrimaryIndex {
  index_id: string;
  index_name: string;
  symbol: string;
  index_value: number | null;
  trend: "up" | "down" | "neutral";
}

export interface IndexFamily {
  family_id: string;
  family_name: string;
  family_description: string;
  family_tickers: string[];
  primary_index: PrimaryIndex | null;
}
