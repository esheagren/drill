import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

interface In { skillId: string; prompt: string; answer: string; correct: boolean; latencyMs: number; ts: number; clientId: string; level?: number; review?: boolean; itemKey?: string; score?: number; expected?: number; theta?: number; beta?: number; ignored?: boolean }

/** POST { user: string, attempts: In[] } — idempotent on (user, clientId). */
export async function POST(req: Request) {
  const body = (await req.json()) as { user?: string; attempts?: In[] };
  const user = body.user?.slice(0, 64);
  const rows = (body.attempts ?? []).slice(0, 500);
  if (!user || !rows.length) return NextResponse.json({ ok: false }, { status: 400 });

  const q = sql();
  await q.query(
    `INSERT INTO attempts (user_token, skill_id, prompt, answer, correct, latency_ms, ts, client_id, level, review, item_key, score, expected, theta, beta, ignored)
     SELECT * FROM UNNEST($1::text[], $2::text[], $3::text[], $4::text[], $5::bool[], $6::int[], $7::timestamptz[], $8::text[], $9::smallint[], $10::bool[], $11::text[], $12::real[], $13::real[], $14::real[], $15::real[], $16::bool[])
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
      rows.map((r) => (r.level ? Math.min(3, Math.max(1, Math.round(Number(r.level)))) : null)),
      rows.map((r) => !!r.review),
      rows.map((r) => (r.itemKey ? String(r.itemKey).slice(0, 64) : null)),
      rows.map((r) => (typeof r.score === "number" ? r.score : null)),
      rows.map((r) => (typeof r.expected === "number" ? r.expected : null)),
      rows.map((r) => (typeof r.theta === "number" ? r.theta : null)),
      rows.map((r) => (typeof r.beta === "number" ? r.beta : null)),
      rows.map((r) => !!r.ignored),
    ],
  );
  return NextResponse.json({ ok: true, n: rows.length });
}
