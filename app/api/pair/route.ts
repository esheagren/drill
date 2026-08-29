import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const okUser = (u: unknown) => (typeof u === "string" && /^[\w-]{8,64}$/.test(u) ? u : null);
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L
const TTL_MS = 10 * 60 * 1000;

/** POST { user } → { code, expiresAt }. Mint a short-lived pairing code for this identity. */
export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string };
  const user = okUser(body.user);
  if (!user) return NextResponse.json({ ok: false }, { status: 400 });
  const q = sql();
  await q.query(`DELETE FROM pair_codes WHERE expires_at < now()`);
  let code = "";
  for (let tries = 0; tries < 5; tries++) {
    code = Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
    const rows = await q.query(
      `INSERT INTO pair_codes (code, user_token, expires_at) VALUES ($1, $2, now() + interval '10 minutes') ON CONFLICT (code) DO NOTHING RETURNING code`,
      [code, user],
    );
    if (rows.length) break;
  }
  return NextResponse.json({ ok: true, code, expiresAt: Date.now() + TTL_MS });
}

/**
 * PUT { code, from } → { user }. Redeem a code on a new device: returns the paired identity
 * and merges anything `from` (this device's provisional identity) already recorded into it.
 */
export async function PUT(req: Request) {
  const body = (await req.json()) as { code?: string; from?: string };
  const code = typeof body.code === "string" ? body.code.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
  const from = okUser(body.from);
  if (code.length !== 6) return NextResponse.json({ ok: false, error: "bad code" }, { status: 400 });
  const q = sql();
  const [row] = await q.query(`SELECT user_token FROM pair_codes WHERE code = $1 AND expires_at > now()`, [code]);
  if (!row) return NextResponse.json({ ok: false, error: "code not found or expired" }, { status: 404 });
  const to = row.user_token as string;
  if (from && from !== to) {
    await q.query(`UPDATE attempts SET user_token = $1 WHERE user_token = $2`, [to, from]);
    await q.query(`UPDATE sessions SET user_token = $1 WHERE user_token = $2`, [to, from]);
    await q.query(`DELETE FROM user_state WHERE user_token = $1`, [from]);
  }
  await q.query(`DELETE FROM pair_codes WHERE code = $1`, [code]);
  return NextResponse.json({ ok: true, user: to });
}
