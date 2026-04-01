-- Tasks synced from the 369stage app (single-tenant, Bearer token on API)

CREATE TABLE tasks (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('active', 'done')),
  current_stage INTEGER NOT NULL CHECK (current_stage IN (30, 60, 90)),
  checklist_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_tasks_updated ON tasks (updated_at DESC);
