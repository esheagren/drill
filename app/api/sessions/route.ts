import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface In { ts: number; durationMs: number; answered: number; correct: number; bySkill: unknown; clientId: string }

/** POST { user: string, sessions: In[] } — idempotent on (user, clientId). */
export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string; sessions?: In[] };
  const user = body.user?.slice(0, 64);
  const rows = (body.sessions ?? []).slice(0, 100);
  if (!user || !rows.length) return NextResponse.json({ ok: false }, { status: 400 });

  const q = sql();
  for (const r of rows) {
    await q.query(
      `INSERT INTO sessions (user_token, started_at, duration_ms, answered, correct, by_skill, client_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (user_token, client_id) DO NOTHING`,
      [user, new Date(Number(r.ts)).toISOString(), Math.round(Number(r.durationMs) || 0),
       Number(r.answered) || 0, Number(r.correct) || 0, JSON.stringify(r.bySkill ?? {}), String(r.clientId).slice(0, 64)],
    );
  }
  return NextResponse.json({ ok: true, n: rows.length });
}
