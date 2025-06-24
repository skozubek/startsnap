/**
 * supabase/functions/_shared/cors.ts
 * Shared CORS configuration for Supabase Edge Functions
 * Enables cross-origin requests for local development and production
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}