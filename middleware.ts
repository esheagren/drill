import { NextResponse, type NextRequest } from "next/server";
import { DS_COOKIE, dsToken } from "@/lib/dsAuth";

export const config = { matcher: ["/designspace/:path*", "/api/designspace/:path*"] };

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/designspace/login" || pathname === "/api/designspace/login") return NextResponse.next();
  const pw = process.env.DESIGNSPACE_PASSWORD;
  const ok = !!pw && req.cookies.get(DS_COOKIE)?.value === (await dsToken(pw));
  if (ok) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.json({ ok: false }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = "/designspace/login"; url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}
