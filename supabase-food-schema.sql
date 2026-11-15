-- Food diary (/food)
-- Run this once in the Supabase SQL Editor.
--
-- One table holds everything: food entries, the vitamins & meds list, the daily
-- checks, weigh-ins, exercise and settings (the `kind` column says which).
--
-- Unlike the other tables on the site, these rows are private. The page sends
-- the SHA-256 of your secret word in an `x-food-key` header, and row-level
-- security only returns or accepts rows whose owner_key equals that header.
-- Without the secret word nobody can read or change the rows, even with the
-- site's public anon key.

CREATE TABLE IF NOT EXISTS food_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_key TEXT NOT NULL,
  kind TEXT NOT NULL,        -- entry | check | item | weight | settings | exercise
  day DATE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- an earlier version of this file restricted `kind` to a fixed list; drop that if present
ALTER TABLE food_rows DROP CONSTRAINT IF EXISTS food_rows_kind_check;

CREATE INDEX IF NOT EXISTS idx_food_rows_owner ON food_rows(owner_key, created_at);

ALTER TABLE food_rows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner only" ON food_rows;
CREATE POLICY "owner only" ON food_rows FOR ALL
  USING (owner_key = (current_setting('request.headers', true)::json ->> 'x-food-key'))
  WITH CHECK (
    length(owner_key) = 64
    AND owner_key = (current_setting('request.headers', true)::json ->> 'x-food-key')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON food_rows TO anon;
