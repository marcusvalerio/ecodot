import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Autenticação necessária." }, { status: 401 });

  let body: { agentId?: unknown; message?: unknown };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido." }, { status: 400 }); }

  if (typeof body.agentId !== "string" || typeof body.message !== "string") {
    return NextResponse.json({ error: "Envie o funcionário e a mensagem." }, { status: 400 });
  }
  const message = body.message.trim();
  if (!message || message.length > 6000) {
    return NextResponse.json({ error: "A mensagem deve ter entre 1 e 6.000 caracteres." }, { status: 400 });
  }

  try {
    const found = await db.query(
      "SELECT name, role_title, directives, status FROM eco_agents WHERE id=$1 AND owner_user_id=$2",
      [body.agentId, user.id]
    );
    if (!found.rowCount) return NextResponse.json({ error: "Funcionário não encontrado." }, { status: 404 });
    const agent = found.rows[0];
    if (agent.status !== "ready" && agent.status !== "running") {
      return NextResponse.json({ error: "Ative o funcionário antes de conversar." }, { status: 409 });
    }

    const key = process.env.AI_API_KEY;
    const model = process.env.AI_MODEL;
    if (!key || !model) {
      return NextResponse.json({ error: "Configure AI_API_KEY e AI_MODEL nas variáveis da Vercel e publique novamente." }, { status: 503 });
    }

    // Store the user's message and load a bounded, owner-scoped context window.
    await db.query(
      "INSERT INTO eco_agent_chat_messages (owner_user_id, agent_id, role, content) VALUES ($1,$2,'user',$3)",
      [user.id, body.agentId, message]
    );
    const history = await db.query(
      "SELECT role, content FROM eco_agent_chat_messages WHERE owner_user_id=$1 AND agent_id=$2 ORDER BY created_at DESC, id DESC LIMIT 20",
      [user.id, body.agentId]
    );
    const context = history.rows.reverse().map((row) => ({
      role: row.role as "user" | "assistant",
      content: String(row.content).slice(0, 6000)
    }));

    const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const response = await fetch(base + "/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [{
          role: "system",
          content: "Você é " + agent.name + ", cargo " + agent.role_title + ", funcionário digital do ECO DOT. Siga estas diretrizes: " + agent.directives +
            "\n\nVocê apenas conversa e gera conteúdo; não alegue executar ações externas ou usar ferramentas que não foram conectadas. Não invente fatos; explicite incertezas."
        }, ...context]
      }),
      signal: AbortSignal.timeout(45000)
    });

    if (!response.ok) {
      console.error("Agent model error", response.status);
      return NextResponse.json({ error: "O provedor de IA falhou. Confira a chave, o modelo e tente novamente." }, { status: 502 });
    }
    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json({ error: "O modelo não retornou uma resposta válida." }, { status: 502 });
    }
    const cleanReply = reply.trim().slice(0, 12000);
    await db.query(
      "INSERT INTO eco_agent_chat_messages (owner_user_id, agent_id, role, content) VALUES ($1,$2,'assistant',$3)",
      [user.id, body.agentId, cleanReply]
    );
    return NextResponse.json({ reply: cleanReply });
  } catch (error) {
    console.error("Chat error", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Não foi possível conversar agora. Confira se a migração 002_chat_history.sql foi aplicada." }, { status: 503 });
  }
}
