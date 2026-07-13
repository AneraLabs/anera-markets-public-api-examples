/**
 * Shared HTTP client for anera.markets API.
 *
 * This file is synchronized with typescript/shared/http.ts.
 * Changes should be made in shared/http.ts and propagated here.
 */

export function baseUrl(): string {
  const base = (process.env.ANERA_MARKETS_API_BASE_URL ?? "https://api.anera.markets").trim().replace(/\/$/, "");
  return base;
}

export function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}

export async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  headers: Record<string, string> = {},
): Promise<T> {
  const url = `${baseUrl()}${path}${buildQuery(params)}`;
  const res = await fetch(url, { headers: { Accept: "application/json", ...headers } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}