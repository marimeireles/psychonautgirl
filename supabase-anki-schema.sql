-- Anki Spaced Repetition System Database Schema
-- Run this in your Supabase SQL Editor

-- Table: anki_decks
-- Stores different subject decks
CREATE TABLE IF NOT EXISTS anki_decks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: anki_cards
-- Stores flashcards with SM-2 algorithm data
CREATE TABLE IF NOT EXISTS anki_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES anki_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval INTEGER DEFAULT 0,
  repetitions INTEGER DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: anki_reviews
-- Stores review history for statistics
CREATE TABLE IF NOT EXISTS anki_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID REFERENCES anki_cards(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_anki_cards_deck_id ON anki_cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_anki_cards_due_date ON anki_cards(due_date);
CREATE INDEX IF NOT EXISTS idx_anki_cards_state ON anki_cards(state);
CREATE INDEX IF NOT EXISTS idx_anki_reviews_card_id ON anki_reviews(card_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE anki_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE anki_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE anki_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth needs)
CREATE POLICY "Enable all operations for anki_decks" ON anki_decks FOR ALL USING (true);
CREATE POLICY "Enable all operations for anki_cards" ON anki_cards FOR ALL USING (true);
CREATE POLICY "Enable all operations for anki_reviews" ON anki_reviews FOR ALL USING (true);
