/**
 * Canonical postal-code matching shared by the Convex backend and the frontend
 * delivery-fee calculator. Having a single source of truth prevents the client
 * from quoting a delivery fee that disagrees with what the server charges.
 *
 * Supported pattern syntaxes:
 *   - Range:    "57190-57199"  (numeric, inclusive)
 *   - Wildcard: "57*"          ('*' matches any sequence, anywhere in the pattern)
 *   - Exact:    "57190"
 */
export function matchesPostalCode(pattern: string, zipCode: string): boolean {
  const p = pattern.trim();
  const zip = zipCode.trim();

  // Range pattern, e.g. "57190-57199"
  const rangeMatch = p.match(/^(\d+)-(\d+)$/);
  if (rangeMatch) {
    const [, start, end] = rangeMatch;
    const zipNum = parseInt(zip, 10);
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);
    return !isNaN(zipNum) && zipNum >= startNum && zipNum <= endNum;
  }

  // Wildcard pattern, e.g. "57*"
  if (p.includes("*")) {
    const escaped = p.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    return new RegExp(`^${escaped}$`).test(zip);
  }

  // Exact match
  return p === zip;
}
