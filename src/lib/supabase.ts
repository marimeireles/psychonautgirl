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
