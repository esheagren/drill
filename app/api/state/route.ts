import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const okUser = (u: unknown) => typeof u === "string" && /^[\w-]{8,64}$/.test(u) ? u : null;

/** GET /api/state?user= → { engine, attempts, sessions[] } for hydrating a fresh install. */
export async function GET(req: Request) {
  const user = okUser(new URL(req.url).searchParams.get("user"));
  if (!user) return NextResponse.json({ ok: false }, { status: 400 });
  const q = sql();
  const [st] = await q.query(`SELECT engine, attempts FROM user_state WHERE user_token = $1`, [user]);
  const sessions = await q.query(
    `SELECT extract(epoch FROM started_at)*1000 AS ts, duration_ms, answered, correct, by_skill
       FROM sessions WHERE user_token = $1 ORDER BY started_at`, [user]);
  return NextResponse.json({
    ok: true,
    engine: st?.engine ?? null,
    attempts: st?.attempts ?? 0,
    sessions: sessions.map((r) => ({ ts: Number(r.ts), durationMs: r.duration_ms, answered: r.answered, correct: r.correct, bySkill: r.by_skill })),
  });
}

/** PUT { user, engine, attempts } → upsert the learner's engine snapshot. */
export async function PUT(req: Request) {
  const body = (await req.json()) as { user?: string; engine?: unknown; attempts?: number };
  const user = okUser(body.user);
  if (!user || !body.engine) return NextResponse.json({ ok: false }, { status: 400 });
  await sql().query(
    `INSERT INTO user_state (user_token, engine, attempts, updated_at) VALUES ($1, $2, $3, now())
     ON CONFLICT (user_token) DO UPDATE SET engine = EXCLUDED.engine, attempts = EXCLUDED.attempts, updated_at = now()`,
    [user, JSON.stringify(body.engine), Math.round(Number(body.attempts) || 0)],
  );
  return NextResponse.json({ ok: true });
}
