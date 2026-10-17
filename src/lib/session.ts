import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type SessionUser = { id: string; username: string; role: "admin" | "member"; exp: number };
const COOKIE = "eco_session";
function sign(payload: string) {
  const secret = process.env.ECO_SESSION_SECRET;
  if (!secret) throw new Error("ECO_SESSION_SECRET não configurado.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
export function createSession(user: Omit<SessionUser, "exp">) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Math.floor(Date.now()/1000)+60*60*24*7 })).toString("base64url");
  return payload + "." + sign(payload);
}
export function verifySession(value?: string): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b)) return null;
  try {
    const user = JSON.parse(Buffer.from(payload,"base64url").toString()) as SessionUser;
    if (!user.id || !user.username || !user.exp || user.exp < Math.floor(Date.now()/1000)) return null;
    return user;
  } catch { return null; }
}
export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value);
}
export const sessionCookieName = COOKIE;
