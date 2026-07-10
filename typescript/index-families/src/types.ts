/**
 * Request/response shapes for the indices API (used to derive families).
 *
 * GET /api/v1/indices
 */

export interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  value: number;
  currency: string;
  featured: boolean;
}

export interface MarketDataResponse {
  indices: MarketIndex[];
  lastUpdated: string;
}

export interface IndexFamilyMember {
  symbol: string;
  name: string;
  value: number | null;
  currency: string;
}

export interface IndexFamily {
  family_name: string;
  members: IndexFamilyMember[];
}
