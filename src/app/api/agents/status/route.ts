import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const user=await getSession();
 if(!user)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 let body:{id?:unknown;status?:unknown};try{body=await request.json();}catch{return NextResponse.json({error:"JSON inválido."},{status:400});}
 if(typeof body.id!=="string"||!["ready","draft"].includes(body.status))return NextResponse.json({error:"Dados inválidos."},{status:400});
 try{
  const r=await db.query('UPDATE eco_agents SET status=$1,updated_at=now() WHERE id=$2 AND owner_user_id=$3 RETURNING id,name,role_title AS role,directives,spec,status,created_at AS "createdAt"',[body.status,body.id,user.id]);
  if(!r.rowCount)return NextResponse.json({error:"Funcionário não encontrado."},{status:404});
  return NextResponse.json({employee:r.rows[0]});
 }catch(e){console.error("Agent status update failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível atualizar o funcionário."},{status:503});}
}