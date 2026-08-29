/** Server-only helpers: password hashing (scrypt, per-user salt) and identity merge. */
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { sql } from "./db";

export const okUser = (u: unknown) => (typeof u === "string" && /^[\w-]{8,64}$/.test(u) ? u : null);
export const okUsername = (u: unknown) => (typeof u === "string" && /^[\w .'-]{1,32}$/.test(u.trim()) ? u.trim() : null);
export const okEmail = (e: unknown) => (typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim()) && e.length <= 254 ? e.trim().toLowerCase() : null);
export const okPassword = (p: unknown) => (typeof p === "string" && p.length >= 8 && p.length <= 200 ? p : null);

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const a = scryptSync(password, salt, 64);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Move everything recorded under `from` onto `to` (a device's provisional identity joining an account). */
export async function mergeIdentity(from: string, to: string): Promise<void> {
  if (from === to) return;
  const q = sql();
  await q.query(`UPDATE attempts SET user_token = $1 WHERE user_token = $2`, [to, from]);
  await q.query(`UPDATE sessions SET user_token = $1 WHERE user_token = $2`, [to, from]);
  await q.query(`DELETE FROM user_state WHERE user_token = $1`, [from]);
  await q.query(`DELETE FROM users WHERE user_token = $1`, [from]);
}
