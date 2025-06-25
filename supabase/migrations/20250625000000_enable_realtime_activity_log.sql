/**
 * supabase/migrations/20250625000000_enable_realtime_activity_log.sql
 *
 * Fix Real-time for Activity Log Table
 *
 * This migration ensures real-time subscriptions work properly for the activity_log table
 * by setting replica identity and ensuring proper RLS policy for realtime access.
 * The table is already in the supabase_realtime publication.
 * This is required for the Community Pulse feature to work properly.
 */

-- Enable replica identity for activity_log table (required for real-time)
-- This is safe to run multiple times
ALTER TABLE public.activity_log REPLICA IDENTITY FULL;

-- Ensure realtime policy allows anonymous subscriptions to public visibility rows
-- Drop existing policy and recreate with better realtime support
DROP POLICY IF EXISTS "Allow public read access to activity logs" ON public.activity_log;

CREATE POLICY "Allow public read access to activity logs"
ON public.activity_log
FOR SELECT
TO public, anon, authenticated
USING (visibility = 'public');

-- Grant necessary permissions for realtime to work
GRANT SELECT ON public.activity_log TO anon;
GRANT SELECT ON public.activity_log TO authenticated;

-- Check if table is already in publication (it appears to be already added)
-- We'll skip adding it since it's already there
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;