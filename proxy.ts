import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/manifest.json", "/sw.js", "/icons", "/favicon.ico"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();

  const secret = process.env.APP_SESSION_SECRET || "";
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const ok = secret ? await verifySessionToken(token, secret) : false;
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Belum masuk" }, { status: 401 });
  }
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
