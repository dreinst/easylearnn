import { NextResponse } from "next/server";
import { createSessionToken, safeEqual, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const expected = process.env.APP_ACCESS_CODE || "";
  const secret = process.env.APP_SESSION_SECRET || "";
  if (!expected || !secret) {
    return NextResponse.json({ error: "APP_ACCESS_CODE atau APP_SESSION_SECRET belum diisi" }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "");
  if (!safeEqual(code, expected)) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ error: "Kode akses salah" }, { status: 401 });
  }
  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
