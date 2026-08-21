/**
 * Shared HTTP client for anera.markets public API.
 *
 * This is the single source of truth. Import from @anera/shared-client.
 *
 * API keys (`iai_sk_...`) are sent as the raw `Authorization` header value
 * (or via the `X-API-Key` header) and must never carry a `Bearer` prefix.
 */

export type HttpParams = Record<string, string | number | undefined>;
export type ExtraHeaders = Record<string, string>;

function resolveBaseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "https://api.anera.markets").trim().replace(/\/$/, "");
  return base;
}

function buildQuery(params: HttpParams): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      search.set(k, String(v));
    }
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

function buildHeaders(extra: ExtraHeaders = {}): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = process.env.ANERA_MARKETS_API_KEY;
  if (apiKey) {
    headers["Authorization"] = apiKey;
  }
  return { ...headers, ...extra };
}

export async function getJson<T>(path: string, params: HttpParams = {}, headers?: ExtraHeaders): Promise<T> {
  const url = `${resolveBaseUrl()}${path}${buildQuery(params)}`;
  const res = await fetch(url, { headers: buildHeaders(headers) });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}