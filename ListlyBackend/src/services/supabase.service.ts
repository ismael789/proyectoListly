import { supabase } from '../config/supabase.js';
import { notConfigured } from '../errors.js';

export function getSupabase() {
  if (!supabase) throw notConfigured();
  return supabase;
}
