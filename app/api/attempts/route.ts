import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface In { skillId: string; prompt: string; answer: string; correct: boolean; latencyMs: number; ts: number; clientId: string }

/** POST { user: string, attempts: In[] } — idempotent on (user, clientId). */
export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string; attempts?: In[] };
  const user = body.user?.slice(0, 64);
  const rows = (body.attempts ?? []).slice(0, 500);
  if (!user || !rows.length) return NextResponse.json({ ok: false }, { status: 400 });

  const q = sql();
  await q.query(
    `INSERT INTO attempts (user_token, skill_id, prompt, answer, correct, latency_ms, ts, client_id)
     SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::bool[], $6::int[], $7::timestamptz[], $8::text[])
     ON CONFLICT (user_token, client_id) DO NOTHING`,
    [
      rows.map(() => user),
      rows.map((r) => String(r.skillId).slice(0, 32)),
      rows.map((r) => String(r.prompt).slice(0, 200)),
      rows.map((r) => String(r.answer).slice(0, 64)),
      rows.map((r) => !!r.correct),
      rows.map((r) => Math.max(0, Math.round(Number(r.latencyMs) || 0))),
      rows.map((r) => new Date(Number(r.ts) || Date.now()).toISOString()),
      rows.map((r) => String(r.clientId).slice(0, 64)),
    ],
  );
  return NextResponse.json({ ok: true, n: rows.length });
}
