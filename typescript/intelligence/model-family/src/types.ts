/**
 * Request/response shapes for the model family intelligence API.
 *
 * GET /api/intelligence/model-family/family/{family_id}
 * GET /api/intelligence/model-family/family/{family_id}/summary
 * GET /api/intelligence/model-family/family/{family_id}/breakdown/daily-revenue-per-model
 * GET /api/intelligence/model-family/family/{family_id}/breakdown/model-rankings
 * GET /api/intelligence/model-family/daily-revenue
 * GET /api/intelligence/model-family/rankings
 */

export type RankingMetric = "revenue" | "tokens";

export interface ModelFamilyRevenuePoint {
  family_id: string;
  family_name: string;
  revenue_usd: number;
}

export interface DailyRevenueEntry {
  date: string;
  families: ModelFamilyRevenuePoint[];
}

export interface DailyRevenueResponse {
  data: DailyRevenueEntry[];
}

export interface ModelFamilyRankingRow {
  family_id: string;
  family_name: string;
  revenue_usd: number;
  token_count: number;
  rank: number;
}

export interface ModelFamilyRankingResponse {
  metric: RankingMetric;
  rows: ModelFamilyRankingRow[];
}

export interface ModelFamilyOverview {
  family_id: string;
  family_name: string;
  description: string;
}

export interface ModelFamilySummaryResponse {
  family_id: string;
  family_name: string;
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
  family_id: string;
  family_name: string;
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
  family_id: string;
  family_name: string;
  from_date: string;
  to_date: string;
  metric: RankingMetric;
  rows: ModelRankingRow[];
}
