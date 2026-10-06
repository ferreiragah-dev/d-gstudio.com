CREATE TABLE IF NOT EXISTS portal_users (
 id uuid PRIMARY KEY, name text NOT NULL, email text NOT NULL UNIQUE,
 password_hash text NOT NULL, role text NOT NULL CHECK (role IN ('client','team')),
 phone text NOT NULL DEFAULT '', notifications_enabled boolean NOT NULL DEFAULT true,
 welcomed_at timestamptz, disabled boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS portal_sessions (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS portal_sessions_user ON portal_sessions(user_id);
CREATE TABLE IF NOT EXISTS portal_password_resets (
 token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS portal_rate_limits (
 key text PRIMARY KEY, attempts integer NOT NULL, expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS clients (
 id uuid PRIMARY KEY, name text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS client_users (
 client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
 can_view_finance boolean NOT NULL DEFAULT false, PRIMARY KEY(client_id,user_id)
);
CREATE TABLE IF NOT EXISTS projects (
 id uuid PRIMARY KEY, client_id uuid NOT NULL REFERENCES clients(id), name text NOT NULL,
 description text NOT NULL DEFAULT '', type text NOT NULL DEFAULT '', scope text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked')),
 starts_on date, due_on date, preview_url text NOT NULL DEFAULT '', public_url text NOT NULL DEFAULT '',
 updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_client ON projects(client_id);
CREATE TABLE IF NOT EXISTS project_members (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 name text NOT NULL, role text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_phases (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title text NOT NULL, description text NOT NULL DEFAULT '', owner text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked')),
 starts_on date, due_on date, completed_on date, notes text NOT NULL DEFAULT '', position integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_tasks (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 phase_id uuid NOT NULL, title text NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked')),
 created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(project_id,phase_id) REFERENCES project_phases(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_milestones (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title text NOT NULL, due_on date NOT NULL,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','in_progress','completed','blocked')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_updates (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title text NOT NULL, description text NOT NULL, type text NOT NULL CHECK(type IN ('update','delivery','approval','revision','development','publication','client_request')),
 author_id uuid NOT NULL REFERENCES portal_users(id), related_url text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_deliveries (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title text NOT NULL, version text NOT NULL, description text NOT NULL DEFAULT '', url text NOT NULL DEFAULT '',
 status text NOT NULL CHECK(status IN ('available','approved','revision_requested')) DEFAULT 'available',
 author_id uuid NOT NULL REFERENCES portal_users(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_delivery_items (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 delivery_id uuid NOT NULL, title text NOT NULL,
 FOREIGN KEY(project_id,delivery_id) REFERENCES project_deliveries(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_approvals (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 delivery_id uuid, title text NOT NULL, version text NOT NULL, description text NOT NULL DEFAULT '', url text NOT NULL DEFAULT '',
 status text NOT NULL CHECK(status IN ('pending','approved','revision_requested')) DEFAULT 'pending',
 decided_by uuid REFERENCES portal_users(id), decided_at timestamptz, comment text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(project_id,delivery_id) REFERENCES project_deliveries(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_requests (
 id uuid PRIMARY KEY, number bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
 project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE, author_id uuid NOT NULL REFERENCES portal_users(id),
 title text NOT NULL, category text NOT NULL, module text NOT NULL DEFAULT '', client_priority text NOT NULL,
 team_priority text NOT NULL DEFAULT 'Normal', description text NOT NULL, owner text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'received' CHECK(status IN ('received','analysis','approved','in_progress','testing','completed','rejected','waiting_client')),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_request_comments (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 request_id uuid NOT NULL, author_id uuid NOT NULL REFERENCES portal_users(id), message text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), FOREIGN KEY(project_id,request_id) REFERENCES project_requests(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_messages (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 author_id uuid NOT NULL REFERENCES portal_users(id), message text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_files (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 request_id uuid, message_id uuid, author_id uuid NOT NULL REFERENCES portal_users(id), name text NOT NULL,
 mime text NOT NULL, size integer NOT NULL CHECK(size > 0 AND size <= 5242880), category text NOT NULL,
 content bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(project_id,request_id) REFERENCES project_requests(project_id,id),
 FOREIGN KEY(project_id,message_id) REFERENCES project_messages(project_id,id)
);
CREATE TABLE IF NOT EXISTS project_notifications (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE, title text NOT NULL,
 section text NOT NULL, read_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_payments (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 title text NOT NULL, amount_cents bigint NOT NULL CHECK(amount_cents >= 0), due_on date NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','paid','cancelled')) DEFAULT 'pending', paid_on date,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS project_activity_log (
 id uuid PRIMARY KEY, project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES portal_users(id), action text NOT NULL, entity_type text NOT NULL,
 entity_id uuid NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user ON project_notifications(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS activity_project ON project_activity_log(project_id,created_at DESC);
CREATE INDEX IF NOT EXISTS requests_project ON project_requests(project_id,created_at DESC);
CREATE INDEX IF NOT EXISTS messages_project ON project_messages(project_id,created_at DESC);
CREATE INDEX IF NOT EXISTS updates_project ON project_updates(project_id,created_at DESC);
CREATE INDEX IF NOT EXISTS files_project ON project_files(project_id,created_at DESC);
