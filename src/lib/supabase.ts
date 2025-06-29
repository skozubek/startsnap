/**
 * src/lib/supabase.ts
 * @description Initializes and exports the Supabase client for database interactions
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://clbqzchawfyaixwnkbgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnF6Y2hhd2Z5YWl4d25rYmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTU0OTEsImV4cCI6MjA2NDE5MTQ5MX0.B3D85OfpKsqYFf5tolzj2kKuVY7GbBjTFJZJlxC-7l4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * @description Supabase client instance configured with environment variables
 * @sideEffects Creates a connection to the Supabase backend
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);