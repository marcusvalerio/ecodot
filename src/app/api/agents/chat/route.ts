import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
export const runtime = "nodejs";
export async function POST(request: Request) {
 const user = await getSession();
 if (!user) return NextResponse.json({error:"Autenticação necessária."},{status:401});
 let body: { agentId?: unknown; messages?: unknown };
 try { body=await request.json(); } catch { return NextResponse.json({error:"JSON inválido."},{status:400}); }
 if(typeof body.agentId!=="string"||!Array.isArray(body.messages)) return NextResponse.json({error:"Dados da conversa inválidos."},{status:400});
 try {
  const found=await db.query("SELECT name,role_title,directives,status FROM eco_agents WHERE id=$1 AND owner_user_id=$2",[body.agentId,user.id]);
  if(!found.rowCount) return NextResponse.json({error:"Funcionário não encontrado."},{status:404});
  const a=found.rows[0];
  if(a.status!=="ready"&&a.status!=="running") return NextResponse.json({error:"Ative o funcionário antes de conversar."},{status:409});
  const key=process.env.AI_API_KEY, model=process.env.AI_MODEL;
  if(!key||!model) return NextResponse.json({error:"Configure AI_API_KEY e AI_MODEL nas variáveis da Vercel e publique novamente."},{status:503});
  const rawMessages=body.messages as Array<{role?:unknown;content?:unknown}>;\n  const messages=rawMessages.filter((m)=>m&&(m.role==="user"||m.role==="assistant")&&typeof m.content==="string").slice(-20).map((m)=>({role:m.role as "user"|"assistant",content:(m.content as string).slice(0,6000)}));
  if(!messages.length||messages[messages.length-1].role!=="user") return NextResponse.json({error:"Envie uma mensagem."},{status:400});
  const base=(process.env.AI_BASE_URL||"https://api.openai.com/v1").replace(/\/$/,"");
  const r=await fetch(base+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify({model,temperature:.4,messages:[{role:"system",content:"Você é "+a.name+", cargo "+a.role_title+", funcionário digital do ECO DOT. Siga estas diretrizes: "+a.directives+"\n\nVocê apenas conversa e gera conteúdo; não alegue executar ações externas ou usar ferramentas que não foram conectadas. Não invente fatos; explicite incertezas."},...messages]}),signal:AbortSignal.timeout(45000)});
  if(!r.ok){console.error("Agent model error",r.status);return NextResponse.json({error:"O provedor de IA falhou. Confira a chave, o modelo e tente novamente."},{status:502});}
  const data=await r.json(), reply=data?.choices?.[0]?.message?.content;
  if(typeof reply!=="string"||!reply.trim()) return NextResponse.json({error:"O modelo não retornou uma resposta válida."},{status:502});
  return NextResponse.json({reply:reply.trim()});
 } catch(e) { console.error("Chat error",e instanceof Error?e.message:"unknown"); return NextResponse.json({error:"Não foi possível conversar agora."},{status:503}); }
}