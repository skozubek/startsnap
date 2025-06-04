/**
 * src/lib/supabase.ts
 * @description Initializes and exports the Supabase client for database interactions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * @description Supabase client instance configured with environment variables
 * @sideEffects Creates a connection to the Supabase backend
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);