import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, okEmail, okPassword, okUser, okUsername } from "@/lib/auth";

/** GET ?user= → { username, email } */
export async function GET(req: Request) {
  const user = okUser(new URL(req.url).searchParams.get("user"));
  if (!user) return NextResponse.json({ ok: false }, { status: 400 });
  const [row] = await sql().query(`SELECT username, email FROM users WHERE user_token = $1`, [user]);
  return NextResponse.json({ ok: true, username: row?.username ?? null, email: row?.email ?? null });
}

/**
 * POST { user, username }                  → create/rename the profile
 * POST { user, email, password }           → attach an email + password (enables sign-in elsewhere)
 */
export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string; username?: string; email?: string; password?: string };
  const user = okUser(body.user);
  if (!user) return NextResponse.json({ ok: false, error: "bad user" }, { status: 400 });
  const q = sql();

  if (body.username !== undefined) {
    const username = okUsername(body.username);
    if (!username) return NextResponse.json({ ok: false, error: "username: 1–32 letters, numbers, spaces" }, { status: 400 });
    await q.query(
      `INSERT INTO users (user_token, username) VALUES ($1, $2)
       ON CONFLICT (user_token) DO UPDATE SET username = EXCLUDED.username, updated_at = now()`,
      [user, username],
    );
    return NextResponse.json({ ok: true, username });
  }

  if (body.email !== undefined) {
    const email = okEmail(body.email);
    const password = okPassword(body.password);
    if (!email) return NextResponse.json({ ok: false, error: "that doesn't look like an email" }, { status: 400 });
    if (!password) return NextResponse.json({ ok: false, error: "password: at least 8 characters" }, { status: 400 });
    const [taken] = await q.query(`SELECT user_token FROM users WHERE email = $1 AND user_token <> $2`, [email, user]);
    if (taken) return NextResponse.json({ ok: false, error: "that email is already on another account — sign in instead" }, { status: 409 });
    await q.query(
      `INSERT INTO users (user_token, username, email, password_hash) VALUES ($1, 'me', $2, $3)
       ON CONFLICT (user_token) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash, updated_at = now()`,
      [user, email, hashPassword(password)],
    );
    return NextResponse.json({ ok: true, email });
  }

  return NextResponse.json({ ok: false, error: "nothing to update" }, { status: 400 });
}
