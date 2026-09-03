import { NextResponse } from "next/server";
import { DS_COOKIE, dsToken } from "@/lib/dsAuth";

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const pw = process.env.DESIGNSPACE_PASSWORD;
  if (!pw || password !== pw) return NextResponse.json({ ok: false }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(DS_COOKIE, await dsToken(pw), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
