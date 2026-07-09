/**
 * Request/response shapes for the ticker endpoint.
 *
 * GET /api/tickers/{symbol}/history
 */

export interface PricePoint {
  date: string;
  value: number;
}

export interface TickerQueryParams {
  startDate?: string;
  endDate?: string;
}
