/**
 * Request/response shapes for the tokens daily API.
 *
 * GET /api/tokens/daily
 */

export interface DailyTokensResponse {
  totalCount: string;
  delta: string | null;
  lastUpdated: string;
}
