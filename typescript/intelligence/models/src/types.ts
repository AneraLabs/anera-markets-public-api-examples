/**
 * Request/response shapes for the models intelligence API.
 *
 * GET /api/v1/intelligence/models/model/{model_id}/summary
 * GET /api/v1/intelligence/models/model/{model_id}/breakdown/daily-revenue-by-token-factory
 * GET /api/v1/intelligence/models/model/{model_id}/breakdown/daily-token-ratio
 * GET /api/v1/intelligence/models/model/{model_id}
 * GET /api/v1/intelligence/models/daily-revenue-per-model
 * GET /api/v1/intelligence/models/rankings
 */

export type ModelRankingMetric = "revenue" | "tokens";

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
  from_date: string;
  to_date: string;
  metric: ModelRankingMetric;
  rows: ModelRankingRow[];
}

export interface ModelOverview {
  model_id: string;
  model_name: string;
  description: string;
}

export interface ModelSummaryResponse {
  model_id: string;
  model_name: string;
  from_date: string;
  to_date: string;
  avg_input_output_ratio_period: number;
  revenue_usd_period: number;
  revenue_stddev_usd_period: number;
  total_tokens_period: number;
  avg_input_output_ratio_7d: number;
  revenue_usd_7d: number;
  revenue_stddev_usd_7d: number;
  total_tokens_7d: number;
}

export interface FactoryDailyRevenuePoint {
  factory_id: string;
  factory_name: string;
  revenue_usd: number;
  token_count: number;
}

export interface DailyRevenueByFactoryEntry {
  date: string;
  factories: FactoryDailyRevenuePoint[];
}

export interface DailyRevenueByFactoryResponse {
  model_id: string;
  model_name: string;
  from_date: string;
  to_date: string;
  data: DailyRevenueByFactoryEntry[];
}

export interface DailyTokenRatioPoint {
  date: string;
  prompt_tokens: number;
  completion_tokens: number;
  reasoning_tokens: number;
  input_output_ratio: number;
  reasoning_share: number;
}

export interface DailyTokenRatioResponse {
  model_id: string;
  model_name: string;
  from_date: string;
  to_date: string;
  data: DailyTokenRatioPoint[];
}
