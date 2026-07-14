/**
 * Run an async main function, exiting with code 1 on unhandled rejection.
 */
export function run(fn: () => Promise<void>): void {
  fn().catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
}

/**
 * Format a large number with human-readable suffixes (K, M, B, T).
 */
export function formatNumber(count: number): string {
  if (count >= 1e12) return `${(count / 1e12).toFixed(2)}T`;
  if (count >= 1e9) return `${(count / 1e9).toFixed(2)}B`;
  if (count >= 1e6) return `${(count / 1e6).toFixed(2)}M`;
  return count.toLocaleString();
}

/**
 * Format a USD amount to a locale-aware string.
 */
export function formatUsd(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format a Date as YYYY-MM-DD.
 */
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}