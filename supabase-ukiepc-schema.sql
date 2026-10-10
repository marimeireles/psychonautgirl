-- UKIEPC 2026 training tracker
-- Run this once in the Supabase SQL Editor.
-- Accounts are username-only (no password): the username is the key to that person's progress.

CREATE TABLE IF NOT EXISTS ukiepc_users (
  username TEXT PRIMARY KEY,              -- lowercased, trimmed
  display_name TEXT NOT NULL,             -- as typed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One row per (user, checklist item). Per-day notes use key "note:<dayId>".
CREATE TABLE IF NOT EXISTS ukiepc_progress (
  username TEXT NOT NULL REFERENCES ukiepc_users(username) ON DELETE CASCADE,
  key TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (username, key)
);

-- Log of problems attempted, independent of the checklist
CREATE TABLE IF NOT EXISTS ukiepc_solves (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL REFERENCES ukiepc_users(username) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  topic TEXT,
  result TEXT NOT NULL DEFAULT 'AC' CHECK (result IN ('AC', 'WA', 'TLE', 'RTE', 'gave up')),
  minutes INTEGER,
  notes TEXT NOT NULL DEFAULT '',
  solved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ukiepc_solves_user ON ukiepc_solves(username, solved_at DESC);

ALTER TABLE ukiepc_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ukiepc_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ukiepc_solves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public" ON ukiepc_users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON ukiepc_progress FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON ukiepc_solves FOR ALL USING (true) WITH CHECK (true);
