import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mergeIdentity, okEmail, okUser, verifyPassword } from "@/lib/auth";

/**
 * POST { email, password, from? } → { user, username }
 * Signs in on a new device: returns the account's identity. If `from` is this
 * device's provisional identity, its history is merged into the account first.
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string; from?: string };
  const email = okEmail(body.email);
  const from = okUser(body.from);
  if (!email || typeof body.password !== "string") return NextResponse.json({ ok: false, error: "email and password required" }, { status: 400 });

  const [row] = await sql().query(`SELECT user_token, username, password_hash FROM users WHERE email = $1`, [email]);
  // Constant-ish time: verify against a dummy hash when the email is unknown.
  const ok = row?.password_hash ? verifyPassword(body.password, row.password_hash) : (verifyPassword(body.password, "scrypt$00$00"), false);
  if (!ok) return NextResponse.json({ ok: false, error: "email or password didn't match" }, { status: 401 });

  if (from && from !== row.user_token) await mergeIdentity(from, row.user_token);
  return NextResponse.json({ ok: true, user: row.user_token, username: row.username });
}
