/**
 * Request/response shapes for the ticker endpoint.
 *
 * GET /api/v1/tickers/{symbol}
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
  startDate?: string;
  endDate?: string;
}
