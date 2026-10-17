-- ECO DOT persistent chat history
CREATE TABLE IF NOT EXISTS eco_agent_chat_messages (
  id bigserial PRIMARY KEY,
  owner_user_id uuid NOT NULL REFERENCES eco_users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES eco_agents(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 12000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eco_agent_chat_history_idx
  ON eco_agent_chat_messages(owner_user_id, agent_id, created_at DESC, id DESC);
