import { createClient } from '@supabase/supabase-js';

// Tipos para las tablas
export interface Conversation {
  id?: string;
  user_message: string;
  bot_response: string;
  user_ip?: string;
  intent?: string;
  lead_score?: number;
  created_at?: string;
}

export interface KnowledgeBase {
  id?: string;
  title: string;
  content: string;
  category: string;
  embedding?: number[];
  metadata?: any;
  created_at?: string;
}

// Cliente de Supabase usando service key (acceso total)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
