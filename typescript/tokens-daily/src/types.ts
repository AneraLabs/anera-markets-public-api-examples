/**
 * Request/response shapes for the daily tokens endpoint.
 *
 * GET /api/v1/tokens/daily
 */

export interface DailyTokensResponse {
  totalCount: string;
  delta: string;
  lastUpdated: string;
}