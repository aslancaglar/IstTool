import type { MutationCtx } from "../_generated/server";

/**
 * Lightweight fixed-window rate limiter backed by the `authRateLimits` table.
 * Used to throttle auth endpoints (login/signup) against brute force and
 * credential stuffing. Keyed per identifier (username/email), since Convex
 * mutations have no request IP.
 *
 * Convex runs mutations with serializable isolation, so the read-modify-write
 * here is safe under concurrency (conflicting attempts retry).
 */
export async function enforceRateLimit(
  ctx: MutationCtx,
  key: string,
  maxAttempts: number,
  windowMs: number,
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("authRateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (!existing || now - existing.windowStart > windowMs) {
    // Start (or restart) the window.
    if (existing) {
      await ctx.db.patch(existing._id, { count: 1, windowStart: now });
    } else {
      await ctx.db.insert("authRateLimits", { key, count: 1, windowStart: now });
    }
    return;
  }

  if (existing.count >= maxAttempts) {
    throw new Error("Trop de tentatives. Veuillez réessayer plus tard.");
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}

/** Clears the counter for a key (call on a successful login). */
export async function clearRateLimit(ctx: MutationCtx, key: string): Promise<void> {
  const existing = await ctx.db
    .query("authRateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();
  if (existing) {
    await ctx.db.delete(existing._id);
  }
}
