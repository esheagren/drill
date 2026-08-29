import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const okUser = (u: unknown) => (typeof u === "string" && /^[\w-]{8,64}$/.test(u) ? u : null);

/** GET ?user=&prefix=mul: → per-item stats: n, correct, median latency, last seen. Ignored (outlier) answers excluded. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = okUser(url.searchParams.get("user"));
  const prefix = (url.searchParams.get("prefix") ?? "").slice(0, 16);
  if (!user || !/^[a-z]+:$/.test(prefix)) return NextResponse.json({ ok: false }, { status: 400 });
  const rows = await sql().query(
    `SELECT item_key AS key, count(*)::int AS n, sum(correct::int)::int AS correct,
            percentile_cont(0.5) WITHIN GROUP (ORDER BY latency_ms)::int AS p50,
            extract(epoch FROM max(ts))*1000 AS last
       FROM attempts
      WHERE user_token = $1 AND item_key LIKE $2 || '%' AND NOT ignored
      GROUP BY item_key`,
    [user, prefix],
  );
  return NextResponse.json({ ok: true, items: rows.map((r) => ({ key: r.key, n: r.n, correct: r.correct, p50: r.p50, last: Number(r.last) })) });
}
