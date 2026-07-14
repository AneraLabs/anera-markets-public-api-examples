/**
 * Shared HTTP client for anera.markets API.
 * Synchronized with typescript/shared/client.ts.
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

export function authHeaders(): Record<string, string> {
  return {
    "Authorization": process.env.ANERA_MARKETS_API_KEY ?? "",
  };
}

export async function getJson<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const url = `${baseUrl()}${path}${buildQuery(params)}`;
  const headers: Record<string, string> = { Accept: "application/json", ...authHeaders() };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
