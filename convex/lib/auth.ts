import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const HASH_VERSION = "pbkdf2_sha256";
const PBKDF2_ITERATIONS = 120_000;

type ReadCtx = Pick<QueryCtx, "db"> | Pick<MutationCtx, "db">;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => Number.parseInt(pair, 16)));
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function sha256Hex(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return bytesToHex(new Uint8Array(digest));
}

async function pbkdf2Hex(password: string, saltHex: string, iterations: number): Promise<string> {
  const salt = hexToBytes(saltHex) as unknown as BufferSource;

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );

  return bytesToHex(new Uint8Array(derived));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16));
  const hash = await pbkdf2Hex(password, salt, PBKDF2_ITERATIONS);
  return `${HASH_VERSION}$${PBKDF2_ITERATIONS}$${salt}$${hash}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; upgradedHash?: string }> {
  if (storedHash.startsWith(`${HASH_VERSION}$`)) {
    const parts = storedHash.split("$");
    if (parts.length !== 4) return { valid: false };

    const iterations = Number.parseInt(parts[1] ?? "", 10);
    const salt = parts[2] ?? "";
    const expected = parts[3] ?? "";
    if (!iterations || !salt || !expected) return { valid: false };

    const computed = await pbkdf2Hex(password, salt, iterations);
    const valid = computed === expected;
    if (!valid) return { valid: false };

    if (iterations < PBKDF2_ITERATIONS) {
      return { valid: true, upgradedHash: await hashPassword(password) };
    }
    return { valid: true };
  }

  // Legacy unsalted SHA-256 support. Rehash on successful login.
  const legacy = await sha256Hex(password);
  if (legacy !== storedHash) return { valid: false };
  return { valid: true, upgradedHash: await hashPassword(password) };
}

async function createSessionToken(): Promise<string> {
  return bytesToHex(randomBytes(32));
}

async function hashSessionToken(sessionToken: string): Promise<string> {
  return sha256Hex(sessionToken);
}

export async function createAdminSession(
  ctx: MutationCtx,
  adminId: Id<"adminUsers">,
): Promise<string> {
  const sessionToken = await createSessionToken();
  await ctx.db.insert("adminSessions", {
    adminId,
    tokenHash: await hashSessionToken(sessionToken),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionToken;
}

export async function createUserSession(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<string> {
  const sessionToken = await createSessionToken();
  await ctx.db.insert("userSessions", {
    userId,
    tokenHash: await hashSessionToken(sessionToken),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return sessionToken;
}

export async function requireAdminSession(ctx: ReadCtx, sessionToken: string) {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }

  const admin = await ctx.db.get(session.adminId);
  if (!admin) {
    throw new Error("Unauthorized");
  }

  return { session, admin };
}

export async function requireUserSession(ctx: ReadCtx, sessionToken: string) {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("userSessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Unauthorized");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Unauthorized");
  }

  return { session, user };
}

export async function maybeGetAdminFromSession(ctx: ReadCtx, sessionToken: string) {
  try {
    const { admin } = await requireAdminSession(ctx, sessionToken);
    return admin;
  } catch {
    return null;
  }
}

export async function maybeGetUserFromSession(ctx: ReadCtx, sessionToken: string) {
  try {
    const { user } = await requireUserSession(ctx, sessionToken);
    return user;
  } catch {
    return null;
  }
}

export async function revokeAdminSession(ctx: MutationCtx, sessionToken: string): Promise<void> {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();

  if (session) {
    await ctx.db.delete(session._id);
  }
}

export async function revokeUserSession(ctx: MutationCtx, sessionToken: string): Promise<void> {
  const tokenHash = await hashSessionToken(sessionToken);
  const session = await ctx.db
    .query("userSessions")
    .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
    .first();

  if (session) {
    await ctx.db.delete(session._id);
  }
}
