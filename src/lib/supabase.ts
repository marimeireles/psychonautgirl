import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface GuestbookEntry {
  id: number;
  name: string;
  message: string;
  created_at: string;
}

export interface ChatMessage {
  id: number;
  username: string;
  message: string;
  created_at: string;
}

export interface CollaborativeDashboard {
  id: number;
  content: string;
  last_updated_by: string;
  updated_at: string;
  created_at: string;
}

// Flashcard types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface FlashcardReview {
  id: string;
  card_id: string;
  rating: 'easy' | 'good' | 'hard' | 'again';
  reviewed_at: string;
  dolphin_state: any; // DolphinSR state object
}

export interface FlashcardState {
  card_id: string;
  dolphin_data: any; // Stores DolphinSR serialized data
  next_review: string;
  last_review?: string;
  updated_at: string;
}
