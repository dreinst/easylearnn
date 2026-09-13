// Sesi berbasis cookie bertanda tangan HMAC. Berjalan di Edge (proxy) maupun Node.
export const SESSION_COOKIE = "el_session";
const SESSION_DAYS = 30;

function enc(s: string) {
  return new TextEncoder().encode(s);
}

function toHex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return toHex(await crypto.subtle.sign("HMAC", key, enc(data)));
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = Date.now() + SESSION_DAYS * 86_400_000;
  const sig = await hmac(secret, String(exp));
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, secret: string): Promise<boolean> {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = await hmac(secret, expStr);
  return safeEqual(sig, expected);
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  };
}
