/**
 * Request/response shapes for the intelligence token-factory API.
 *
 * GET /api/v1/intelligence/token-factory/daily-revenue?days={days}
 * GET /api/v1/intelligence/token-factory/rankings?days={days}&metric={metric}&limit={limit}
 * GET /api/v1/intelligence/token-factory/factory/{factory_id}
 * GET /api/v1/intelligence/token-factory/factory/{factory_id}/summary?days={days}
 * GET /api/v1/intelligence/token-factory/factory/{factory_id}/breakdown/daily-revenue-per-model?days={days}
 * GET /api/v1/intelligence/token-factory/factory/{factory_id}/breakdown/model-rankings?days={days}&metric={metric}
 */

export type RankingMetric = "revenue" | "utilisation";
export type ModelRankingMetric = "revenue" | "tokens";

export interface TokenFactoryRevenuePoint {
  factory_id: string;
  factory_name: string;
  revenue_usd: number;
}

export interface DailyRevenueEntry {
  date: string;
  factories: TokenFactoryRevenuePoint[];
}

export interface DailyRevenueResponse {
  data: DailyRevenueEntry[];
}

export interface TokenFactoryRankingRow {
  factory_id: string;
  factory_name: string;
  revenue_usd: number;
  token_utilisation: number;
  rank: number;
}

export interface TokenFactoryRankingResponse {
  metric: RankingMetric;
  rows: TokenFactoryRankingRow[];
}

export interface TokenFactoryOverview {
  factory_id: string;
  factory_name: string;
  description: string;
}

export interface TokenFactorySummaryResponse {
  factory_id: string;
  factory_name: string;
  from_date: string;
  to_date: string;
  models_supported_period: number;
  revenue_usd_period: number;
  revenue_stddev_usd_period: number;
  gross_profit_usd_period: number | null;
  models_supported_7d: number;
  revenue_usd_7d: number;
  revenue_stddev_usd_7d: number;
  gross_profit_usd_7d: number | null;
}

export interface ModelDailyRevenuePoint {
  model_id: string;
  model_name: string;
  revenue_usd: number;
  token_count: number;
}

export interface DailyRevenuePerModelEntry {
  date: string;
  models: ModelDailyRevenuePoint[];
}

export interface DailyRevenuePerModelResponse {
  factory_id: string;
  factory_name: string;
  from_date: string;
  to_date: string;
  data: DailyRevenuePerModelEntry[];
}

export interface ModelRankingRow {
  model_id: string;
  model_name: string;
  revenue_usd: number;
  token_count: number;
  rank: number;
}

export interface ModelRankingResponse {
  factory_id: string;
  factory_name: string;
  from_date: string;
  to_date: string;
  metric: ModelRankingMetric;
  rows: ModelRankingRow[];
}
