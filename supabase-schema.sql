-- Guestbook
CREATE TABLE guestbook (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scratch pad / Dashboard
CREATE TABLE collaborative_dashboard (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  last_updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anki decks
CREATE TABLE anki_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anki cards
CREATE TABLE anki_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID REFERENCES anki_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor REAL DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ DEFAULT NOW(),
  state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Anki reviews
CREATE TABLE anki_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES anki_cards(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 4),
  reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (public access)
ALTER TABLE guestbook ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE anki_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE anki_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE anki_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public" ON guestbook FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON collaborative_dashboard FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON anki_decks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON anki_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public" ON anki_reviews FOR ALL USING (true) WITH CHECK (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE collaborative_dashboard;
