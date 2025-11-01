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

export interface AnkiDeck {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface AnkiCard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  due_date: string;
  state: 'new' | 'learning' | 'review';
  created_at: string;
}

export interface AnkiReview {
  id: string;
  card_id: string;
  rating: 1 | 2 | 3 | 4;
  reviewed_at: string;
}
