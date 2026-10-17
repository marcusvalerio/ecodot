import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
type Context = { params: Promise<{id:string}> };
export async function PATCH(request:Request,context:Context) {
 const user=await getSession(); if(!user)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 const {id}=await context.params;
 let body:{name?:unknown;role?:unknown;directives?:unknown;spec?:unknown};
 try{body=await request.json()}catch{return NextResponse.json({error:"JSON inválido."},{status:400})}
 const name=typeof body.name==="string"?body.name.trim():"";
 const role=typeof body.role==="string"?body.role.trim():"Funcionário de IA";
 const directives=typeof body.directives==="string"?body.directives.trim():"";
 if(!name||name.length>120||directives.length<20||directives.length>24000||role.length>160)return NextResponse.json({error:"Confira nome, cargo e diretrizes."},{status:400});
 try{
  const spec=body.spec&&typeof body.spec==="object"?JSON.stringify(body.spec):null;
  const result=await db.query("UPDATE eco_agents SET name=$1,role_title=$2,directives=$3,spec=$4::jsonb,updated_at=now() WHERE id=$5 AND owner_user_id=$6 RETURNING id,name,role_title AS role,directives,spec,status,created_at AS \"createdAt\",updated_at AS \"updatedAt\"",[name,role||"Funcionário de IA",directives,spec,id,user.id]);
  if(!result.rowCount)return NextResponse.json({error:"Funcionário não encontrado."},{status:404});
  return NextResponse.json({employee:result.rows[0]});
 }catch(error){console.error("Update agent failed",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Não foi possível atualizar o funcionário."},{status:503})}
}
export async function DELETE(_request:Request,context:Context){
 const user=await getSession();if(!user)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 const {id}=await context.params;
 try{const result=await db.query("DELETE FROM eco_agents WHERE id=$1 AND owner_user_id=$2 RETURNING id",[id,user.id]);if(!result.rowCount)return NextResponse.json({error:"Funcionário não encontrado."},{status:404});return NextResponse.json({ok:true})}
 catch(error){console.error("Delete agent failed",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"Não foi possível excluir o funcionário."},{status:503})}
}
