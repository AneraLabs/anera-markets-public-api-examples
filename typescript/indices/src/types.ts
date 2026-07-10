/**
 * Request/response shapes for the indices API.
 *
 * GET /api/v1/indices
 * GET /api/v1/indices/summary
 * GET /api/v1/indices/{index_id}
 */

export interface CompositionData {
  date: string;
  [key: string]: string | number;
}

export interface IndexGroup {
  id: string;
  name: string;
  description: string;
  primary_index: string | null;
  what_it_does_markdown: string | null;
  methodology_url: string | null;
}

export interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  value: number;
  currency: string;
  change: number;
  changeAbsolute: number;
  changeDay: number;
  changeWeek: number;
  changeMonth: number;
  change3Month: number;
  timestamp: string;
  group: IndexGroup | null;
  description: string;
  startDate: string;
  methodologyPdfUrl: string | null;
  featuredArticles: object[];
  compositionHistory: CompositionData[];
  relatedTickers: string[];
  rebalancingPeriod: string | null;
  evaluationParams: object | null;
  featured: boolean;
}

export interface MarketDataResponse {
  indices: MarketIndex[];
  lastUpdated: string;
}

export interface IndicesSummaryResponse {
  models_count: number;
  token_spend: number;
}
