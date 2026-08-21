/**
 * Request/response shapes for the ticker endpoint.
 *
 * GET /api/v1/tickers/{index_id}
 */

export interface TickerItem {
  timestamp: string;
  value: number;
}

export interface TickerHistoryResponse {
  symbol: string;
  start_date: string;
  end_date: string;
  items: TickerItem[];
}

export interface TickerQueryParams {
  indexId?: string;
  startDate?: string;
  endDate?: string;
  timePeriod?: number;
}