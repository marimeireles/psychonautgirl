-- Daemon notes: the floating cheatsheet bubble on /interview, /anki and /ukiepc.
-- Run this once in the Supabase SQL Editor.
-- One shared note (id = 1); the page falls back to localStorage until this table exists.

CREATE TABLE IF NOT EXISTS daemon_notes (
  id INTEGER PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE daemon_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public" ON daemon_notes FOR ALL USING (true) WITH CHECK (true);
