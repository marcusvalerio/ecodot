import { NextResponse } from "next/server";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
const scrypt = promisify(scryptCallback);
async function hashPassword(password:string){
 const salt=randomBytes(16).toString("hex");
 const hash=await scrypt(password,salt,64) as Buffer;
 return salt+":"+hash.toString("hex");
}
export async function GET(){
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 if(session.role!=="admin")return NextResponse.json({error:"Apenas administradores podem gerenciar usuários."},{status:403});
 try{const result=await db.query("SELECT id,username,role,is_active,created_at AS \"createdAt\" FROM eco_users ORDER BY created_at ASC");return NextResponse.json({users:result.rows})}
 catch(error){console.error("List users failed",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Não foi possível listar usuários."},{status:503})}
}
export async function POST(request:Request){
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 if(session.role!=="admin")return NextResponse.json({error:"Apenas administradores podem criar usuários."},{status:403});
 let body:{username?:unknown;password?:unknown;role?:unknown};
 try{body=await request.json()}catch{return NextResponse.json({error:"JSON inválido."},{status:400})}
 const username=typeof body.username==="string"?body.username.trim().toLowerCase():"";
 const password=typeof body.password==="string"?body.password:"";
 const role=body.role==="admin"?"admin":"member";
 if(!/^[a-z0-9._-]{3,80}$/.test(username)||password.length<12||password.length>200)return NextResponse.json({error:"Usuário inválido ou senha menor que 12 caracteres."},{status:400});
 try{
  const hash=await hashPassword(password);
  const result=await db.query("INSERT INTO eco_users(username,password_hash,role) VALUES($1,$2,$3) ON CONFLICT(username) DO NOTHING RETURNING id,username,role,is_active,created_at AS \"createdAt\"",[username,hash,role]);
  if(!result.rowCount)return NextResponse.json({error:"Esse usuário já existe."},{status:409});
  await db.query("INSERT INTO eco_audit_log(actor_user_id,action,resource_type,resource_id,metadata) VALUES($1,'user.created','user',$2,$3::jsonb)",[session.id,result.rows[0].id,JSON.stringify({username,role})]);
  return NextResponse.json({user:result.rows[0]},{status:201});
 }catch(error){console.error("Create user failed",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Não foi possível criar usuário."},{status:503})}
}
