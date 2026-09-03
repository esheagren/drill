import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const okPage = (p: unknown) => (typeof p === "string" && /^[a-z0-9-]{1,40}$/.test(p) ? p : null);

/** GET ?page= → { text }  ·  PUT { page, text } — shared notes per designspace page (read by Erik and by Claude). */
export async function GET(req: Request) {
  const page = okPage(new URL(req.url).searchParams.get("page"));
  if (!page) return NextResponse.json({ ok: false }, { status: 400 });
  const [row] = await sql().query(`SELECT text, updated_at FROM designspace_notes WHERE page = $1`, [page]);
  return NextResponse.json({ ok: true, text: row?.text ?? "", updatedAt: row?.updated_at ?? null });
}
export async function PUT(req: Request) {
  const body = (await req.json()) as { page?: string; text?: string };
  const page = okPage(body.page);
  if (!page || typeof body.text !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  await sql().query(
    `INSERT INTO designspace_notes (page, text, updated_at) VALUES ($1, $2, now()) ON CONFLICT (page) DO UPDATE SET text = EXCLUDED.text, updated_at = now()`,
    [page, body.text.slice(0, 20000)],
  );
  return NextResponse.json({ ok: true });
}
