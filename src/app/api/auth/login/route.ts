import { NextResponse } from "next/server";
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";
import { createSession, sessionCookieName } from "@/lib/session";
export const runtime = "nodejs";
const scrypt = promisify(scryptCallback);

function hashPassword(password: string, salt: string) {
  return scrypt(password, salt, 64) as Promise<Buffer>;
}
async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = await hashPassword(password, salt);
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
async function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + (await hashPassword(password, salt)).toString("hex");
}
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({error:"JSON inválido."},{status:400}); }
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase().slice(0,80) : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[a-z0-9._-]{3,80}$/.test(username) || password.length < 8 || password.length > 200) return NextResponse.json({error:"Usuário ou senha inválidos."},{status:400});
  try {
    let result = await db.query("SELECT id, username, password_hash, role, is_active FROM eco_users WHERE username=$1 LIMIT 1",[username]);
    let user = result.rows[0];
    const initialUsername = (process.env.ECO_ADMIN_USERNAME || "").trim().toLowerCase();
    const initialPassword = process.env.ECO_ADMIN_PASSWORD || "";
    if (!user && initialUsername && initialPassword && username === initialUsername && password === initialPassword) {
      const passwordHash = await createPasswordHash(password);
      const inserted = await db.query("INSERT INTO eco_users(username,password_hash,role) VALUES($1,$2,'admin') ON CONFLICT(username) DO UPDATE SET username=EXCLUDED.username RETURNING id, username, password_hash, role, is_active",[username,passwordHash]);
      user = inserted.rows[0];
    }
    if (!user || !user.is_active || !(await verifyPassword(password,user.password_hash))) return NextResponse.json({error:"Usuário ou senha inválidos."},{status:401});
    const token = createSession({id:user.id,username:user.username,role:user.role});
    const response = NextResponse.json({user:{id:user.id,username:user.username,role:user.role}});
    response.cookies.set(sessionCookieName,token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*7});
    return response;
  } catch (error) {
    console.error("ECO DOT login failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({error:"Serviço de autenticação indisponível. Verifique a configuração do banco."},{status:503});
  }
}
