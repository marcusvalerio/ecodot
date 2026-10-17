import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({error:"Autenticação necessária."},{status:401});
  try {
    const result = await db.query("SELECT id, name, role_title AS role, directives, spec, status, created_at AS \"createdAt\", updated_at AS \"updatedAt\" FROM eco_agents WHERE owner_user_id=$1 ORDER BY updated_at DESC",[user.id]);
    return NextResponse.json({employees:result.rows});
  } catch (error) {
    console.error("List agents failed",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"Não foi possível carregar os funcionários."},{status:503});
  }
}
export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({error:"Autenticação necessária."},{status:401});
  let body: {name?:unknown;role?:unknown;directives?:unknown;spec?:unknown};
  try { body=await request.json(); } catch { return NextResponse.json({error:"JSON inválido."},{status:400}); }
  const name=typeof body.name==="string"?body.name.trim():"";
  const role=typeof body.role==="string"?body.role.trim():"Funcionário de IA";
  const directives=typeof body.directives==="string"?body.directives.trim():"";
  if (!name || name.length>120 || directives.length<20 || directives.length>24000 || role.length>160) return NextResponse.json({error:"Confira nome, cargo e diretrizes (20 a 24.000 caracteres)."}, {status:400});
  try {
    const spec=body.spec && typeof body.spec==="object" ? JSON.stringify(body.spec) : null;
    const result=await db.query("INSERT INTO eco_agents(owner_user_id,name,role_title,directives,spec,status) VALUES($1,$2,$3,$4,$5::jsonb,$6) RETURNING id,name,role_title AS role,directives,spec,status,created_at AS \"createdAt\",updated_at AS \"updatedAt\"",[user.id,name,role||"Funcionário de IA",directives,spec,"draft"]);
    return NextResponse.json({employee:result.rows[0]},{status:201});
  } catch (error) {
    console.error("Create agent failed",error instanceof Error?error.message:"unknown");
    return NextResponse.json({error:"Não foi possível salvar o funcionário."},{status:503});
  }
}
