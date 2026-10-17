import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
export async function GET(request: Request) {
 const user=await getSession();
 if(!user)return NextResponse.json({error:"Autenticação necessária."},{status:401});
 const id=new URL(request.url).searchParams.get("id");
 if(!id)return NextResponse.json({error:"Informe o funcionário."},{status:400});
 try{
  const r=await db.query('SELECT id,name,role_title AS role,directives,spec,status,created_at AS "createdAt" FROM eco_agents WHERE id=$1 AND owner_user_id=$2',[id,user.id]);
  if(!r.rowCount)return NextResponse.json({error:"Funcionário não encontrado."},{status:404});
  return NextResponse.json({employee:r.rows[0]});
 }catch(e){console.error("Get agent failed",e instanceof Error?e.message:"unknown");return NextResponse.json({error:"Não foi possível carregar o funcionário."},{status:503});}
}