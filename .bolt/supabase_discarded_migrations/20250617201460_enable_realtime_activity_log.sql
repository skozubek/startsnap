/**
 * supabase/migrations/20250617201460_enable_realtime_activity_log.sql
 *
 * Enable Real-time for Activity Log Table
 *
 * This migration enables real-time subscriptions for the activity_log table
 * by adding it to the supabase_realtime publication and setting replica identity.
 */

-- Enable replica identity for activity_log table (required for real-time)
-- ALTER TABLE public.activity_log REPLICA IDENTITY FULL;

-- Add activity_log table to the real-time publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;