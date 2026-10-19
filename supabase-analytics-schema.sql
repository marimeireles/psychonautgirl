-- Visitor analytics: location only, never the IP.
-- Run this once in the Supabase SQL Editor.
--
-- The visitor's own browser asks a geolocation API where it is, and only the
-- resulting place names are inserted here. No IP address, user agent, or any
-- other identifying info is stored.

CREATE TABLE IF NOT EXISTS site_visits (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  country TEXT NOT NULL DEFAULT 'unknown',
  country_code TEXT NOT NULL DEFAULT '',   -- ISO 3166-1 alpha-2, e.g. "BR"
  region TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can log a visit" ON site_visits;
CREATE POLICY "anyone can log a visit"
  ON site_visits FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anyone can read visit stats" ON site_visits;
CREATE POLICY "anyone can read visit stats"
  ON site_visits FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS site_visits_created_at_idx ON site_visits (created_at DESC);
