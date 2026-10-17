-- ECO DOT initial persistent data model
CREATE TABLE IF NOT EXISTS eco_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin','member')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS eco_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES eco_users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  role_title text NOT NULL DEFAULT 'Funcionário de IA',
  directives text NOT NULL CHECK (length(directives) BETWEEN 20 AND 24000),
  spec jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','needs_configuration','ready','running','paused','error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS eco_agents_owner_updated_idx ON eco_agents(owner_user_id, updated_at DESC);
CREATE TABLE IF NOT EXISTS eco_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES eco_agents(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL REFERENCES eco_users(id) ON DELETE CASCADE,
  instruction text NOT NULL CHECK (length(instruction) BETWEEN 1 AND 12000),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','waiting_approval','succeeded','failed','cancelled')),
  result jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);
CREATE INDEX IF NOT EXISTS eco_tasks_owner_created_idx ON eco_tasks(owner_user_id, created_at DESC);
CREATE TABLE IF NOT EXISTS eco_audit_log (
  id bigserial PRIMARY KEY,
  actor_user_id uuid REFERENCES eco_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
