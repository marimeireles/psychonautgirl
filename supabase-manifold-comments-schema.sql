-- Public peer review on /principles-of-intelligence
-- Run this once in the Supabase SQL Editor.
--
-- Anyone can read the comments and add one. Nobody can edit or delete from the
-- website: to remove a comment, delete its row here in the Supabase Table Editor.

CREATE TABLE IF NOT EXISTS manifold_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- which paragraph: "<section id>:<paragraph number>", e.g. "motivation:0" or "summary:0"
  para TEXT NOT NULL CHECK (char_length(para) <= 80),
  -- where the highlighted passage started inside that paragraph (a hint; the quote is what anchors it)
  start_offset INTEGER NOT NULL DEFAULT 0 CHECK (start_offset >= 0),
  -- the highlighted passage itself
  quote TEXT NOT NULL CHECK (char_length(quote) BETWEEN 1 AND 1200),
  name TEXT NOT NULL DEFAULT 'Anonymous' CHECK (char_length(name) BETWEEN 1 AND 60),
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS manifold_comments_created_at_idx ON manifold_comments (created_at);

ALTER TABLE manifold_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can read" ON manifold_comments;
DROP POLICY IF EXISTS "anyone can add" ON manifold_comments;
CREATE POLICY "anyone can read" ON manifold_comments FOR SELECT USING (true);
CREATE POLICY "anyone can add" ON manifold_comments FOR INSERT WITH CHECK (true);
