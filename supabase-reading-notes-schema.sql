-- Per-item notes on the interview gym checklists (/interview: the deepmind reading
-- list and the jax & maths tracker). Double-click an item to write a note about it.
-- Run this once in the Supabase SQL Editor.
-- The page falls back to localStorage until this table exists.
--
-- Like daemon_notes, these rows are public (anyone with the site's anon key can
-- read and write them). Keep anything private in the food diary instead.

CREATE TABLE IF NOT EXISTS item_notes (
  list TEXT NOT NULL,          -- which checklist: 'deepmind' | 'jax'
  item_id TEXT NOT NULL,       -- the item's id in src/data/*.ts
  body TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list, item_id)
);

ALTER TABLE item_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public" ON item_notes;
CREATE POLICY "public" ON item_notes FOR ALL USING (true) WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON item_notes TO anon;
