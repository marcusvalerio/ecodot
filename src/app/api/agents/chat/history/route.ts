import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });
  const agentId = new URL(request.url).searchParams.get("agentId");
  if (!agentId) return NextResponse.json({ error: "Informe o funcionário." }, { status: 400 });

  try {
    const agent = await db.query(
      "SELECT id FROM eco_agents WHERE id=$1 AND owner_user_id=$2",
      [agentId, user.id]
    );
    if (!agent.rowCount) return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });

    const result = await db.query(
      "SELECT role, content, created_at AS \"createdAt\" FROM (SELECT id, role, content, created_at FROM eco_agent_chat_messages WHERE owner_user_id=$1 AND agent_id=$2 ORDER BY created_at DESC, id DESC LIMIT 100) recent ORDER BY created_at ASC, id ASC",
      [user.id, agentId]
    );
    return NextResponse.json({ messages: result.rows });
  } catch (error) {
    console.error("Chat history failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Não foi possível carregar o histórico. Confira se a migração 002_chat_history.sql foi aplicada." }, { status: 503 });
  }
}
