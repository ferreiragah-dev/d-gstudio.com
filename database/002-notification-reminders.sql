ALTER TABLE project_notifications ADD COLUMN IF NOT EXISTS dedupe_key text UNIQUE;
CREATE INDEX IF NOT EXISTS payments_due ON project_payments(project_id,due_on) WHERE status='pending';
