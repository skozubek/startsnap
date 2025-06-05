-- Drop incorrect foreign key constraints
ALTER TABLE public.feedbacks DROP CONSTRAINT IF EXISTS feedbacks_user_id_fkey_profiles;

-- Correct relationship for joining profiles with feedbacks
-- No new FK constraint needed - the auth.users FK is sufficient
-- We'll join through user_id in the query

-- Create function to get username for a feedback
CREATE OR REPLACE FUNCTION get_profile_for_feedback(feedback_row feedbacks)
RETURNS SETOF profiles AS $$
  SELECT p.* FROM profiles p WHERE p.user_id = feedback_row.user_id
$$ LANGUAGE sql STABLE;

-- This allows us to do the query with proper relationship