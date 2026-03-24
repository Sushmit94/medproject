/** Safely extract a single string from an Express query parameter */
export function qstr(val: unknown): string | undefined {
  if (typeof val === "string") return val;
  if (Array.isArray(val) && typeof val[0] === "string") return val[0];
  return undefined;
}

/** Cap pagination limit to prevent DoS via large page sizes */
export function safeLimit(val: string | unknown, max = 100): number {
  const n = Number(val) || 20;
  return Math.min(Math.max(n, 1), max);
}
