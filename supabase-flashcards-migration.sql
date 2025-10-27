-- Flashcard tables for Anki-like spaced repetition system
-- Run this SQL in your Supabase SQL Editor

-- Table for storing flashcards
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for storing review history
CREATE TABLE IF NOT EXISTS flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('easy', 'good', 'hard', 'again')),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dolphin_state JSONB NOT NULL
);

-- Table for storing current state of each card (for DolphinSR)
CREATE TABLE IF NOT EXISTS flashcard_states (
  card_id UUID PRIMARY KEY REFERENCES flashcards(id) ON DELETE CASCADE,
  dolphin_data JSONB NOT NULL,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL,
  last_review TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcard_reviews_card_id ON flashcard_reviews(card_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_states_next_review ON flashcard_states(next_review);
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_states ENABLE ROW LEVEL SECURITY;

-- Policies (allow all for now - you can restrict these later if you add auth)
CREATE POLICY "Allow all operations on flashcards" ON flashcards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on flashcard_reviews" ON flashcard_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on flashcard_states" ON flashcard_states FOR ALL USING (true) WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_flashcards_updated_at
  BEFORE UPDATE ON flashcards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcard_states_updated_at
  BEFORE UPDATE ON flashcard_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
