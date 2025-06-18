/**
 * supabase/migrations/20250618132113_feedback_reply_cleanup_trigger.sql
 *
 * Feedback Reply Cleanup Trigger
 *
 * Problem: When feedback replies are deleted, the corresponding activity_log entries
 * for 'feedback_reply_added' are not automatically cleaned up, leaving orphaned entries
 * in the activity feed.
 *
 * Solution: Add DELETE trigger on feedback_replies to automatically clean up the
 * corresponding activity_log entries, maintaining consistency with other CASCADE DELETE
 * behavior in the system (like vibe logs).
 */

-- Trigger: Clean up activity logs when feedback replies are deleted
CREATE OR REPLACE FUNCTION public.log_feedback_reply_deleted() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Delete the corresponding activity log entries for this reply
    DELETE FROM public.activity_log
    WHERE activity_type = 'feedback_reply_added'
      AND actor_user_id = OLD.user_id
      AND target_feedback_id = OLD.parent_feedback_id
      AND created_at >= (OLD.created_at - INTERVAL '1 minute')
      AND created_at <= (OLD.created_at + INTERVAL '1 minute');

    RETURN OLD;
END;
$$;

-- Drop existing trigger if it exists (for safe migration)
DROP TRIGGER IF EXISTS trigger_log_feedback_reply_deleted ON public.feedback_replies;

CREATE TRIGGER trigger_log_feedback_reply_deleted
    AFTER DELETE ON public.feedback_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.log_feedback_reply_deleted();
