/**
 * supabase/migrations/20250617201459_spam_prevention_triggers.sql
 *
 * Critical Fix: Activity Log Spam Prevention
 *
 * Problem: Users can spam support/unsupport actions creating noise in activity feed
 * Solution: Time-based deduplication - prevent logging if user has recent activity for same project
 */

-- Enhanced support logging with spam prevention
CREATE OR REPLACE FUNCTION public.log_project_supported() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_support_count integer;
    recent_activity_count integer;
BEGIN
    -- Critical Fix: Check for recent support/unsupport spam (last 5 minutes)
    SELECT COUNT(*) INTO recent_activity_count
    FROM public.activity_log
    WHERE actor_user_id = NEW.user_id
      AND target_startsnap_id = NEW.startsnap_id
      AND activity_type IN ('project_supported', 'project_unsupported')
      AND created_at > NOW() - INTERVAL '5 minutes';

    -- Only log if no recent spam activity
    IF recent_activity_count = 0 THEN
        -- Get current support count (trigger already incremented via existing trigger)
        SELECT support_count INTO new_support_count
        FROM public.startsnaps
        WHERE id = NEW.startsnap_id;

        -- Log the support activity
        PERFORM public.create_activity_log(
            'project_supported',
            NEW.user_id,
            NEW.startsnap_id,
            NULL, NULL, NULL, NULL,
            '{}'::jsonb
        );

        -- Check for milestone achievements
        PERFORM public.check_support_milestone(NEW.startsnap_id, new_support_count);
    ELSE
        -- Log spam prevention (for debugging/monitoring)
        PERFORM public.create_activity_log(
            'project_supported',
            NEW.user_id,
            NEW.startsnap_id,
            NULL, NULL, NULL, NULL,
            jsonb_build_object('spam_prevented', true),
            'hidden'  -- Hidden from public feed
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Enhanced unsupport logging with spam prevention
CREATE OR REPLACE FUNCTION public.log_project_unsupported() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    recent_activity_count integer;
BEGIN
    -- Critical Fix: Check for recent support/unsupport spam (last 5 minutes)
    SELECT COUNT(*) INTO recent_activity_count
    FROM public.activity_log
    WHERE actor_user_id = OLD.user_id
      AND target_startsnap_id = OLD.startsnap_id
      AND activity_type IN ('project_supported', 'project_unsupported')
      AND created_at > NOW() - INTERVAL '5 minutes';

    -- Only log if no recent spam activity
    IF recent_activity_count = 0 THEN
        -- Decrement support count (keep existing logic)
        PERFORM decrement_support_count(OLD.startsnap_id);

        -- Log unsupport activity (low priority)
        PERFORM public.create_activity_log(
            'project_unsupported',
            OLD.user_id,
            OLD.startsnap_id,
            NULL, NULL, NULL, NULL,
            '{}'::jsonb,
            'low_priority'
        );
    ELSE
        -- Still decrement count (business logic must work)
        PERFORM decrement_support_count(OLD.startsnap_id);

        -- Log spam prevention (hidden)
        PERFORM public.create_activity_log(
            'project_unsupported',
            OLD.user_id,
            OLD.startsnap_id,
            NULL, NULL, NULL, NULL,
            jsonb_build_object('spam_prevented', true),
            'hidden'  -- Hidden from public feed
        );
    END IF;

    RETURN OLD;
END;
$$;

-- Enhanced profile update logging with spam prevention
CREATE OR REPLACE FUNCTION public.log_profile_updated() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    has_social_changes boolean := false;
    has_profile_changes boolean := false;
    recent_profile_updates integer;
BEGIN
    -- Check for MEANINGFUL social link changes (empty -> filled or filled -> different)
    -- Ignore NULL <-> '' changes (database noise)
    IF (COALESCE(TRIM(OLD.github_url), '') != COALESCE(TRIM(NEW.github_url), '') AND
        COALESCE(TRIM(NEW.github_url), '') != '') OR
       (COALESCE(TRIM(OLD.twitter_url), '') != COALESCE(TRIM(NEW.twitter_url), '') AND
        COALESCE(TRIM(NEW.twitter_url), '') != '') OR
       (COALESCE(TRIM(OLD.linkedin_url), '') != COALESCE(TRIM(NEW.linkedin_url), '') AND
        COALESCE(TRIM(NEW.linkedin_url), '') != '') OR
       (COALESCE(TRIM(OLD.website_url), '') != COALESCE(TRIM(NEW.website_url), '') AND
        COALESCE(TRIM(NEW.website_url), '') != '') THEN
        has_social_changes := true;
    END IF;

    -- Check for other meaningful profile changes
    IF (COALESCE(TRIM(OLD.bio), '') != COALESCE(TRIM(NEW.bio), '')) OR
       (COALESCE(TRIM(OLD.username), '') != COALESCE(TRIM(NEW.username), '')) THEN
        has_profile_changes := true;
    END IF;

    -- Critical Fix: Prevent profile update spam (max 3 updates per hour)
    SELECT COUNT(*) INTO recent_profile_updates
    FROM public.activity_log
    WHERE actor_user_id = NEW.user_id
      AND activity_type IN ('profile_updated', 'social_links_added')
      AND created_at > NOW() - INTERVAL '1 hour';

    -- Only log if not spamming and has meaningful changes
    IF recent_profile_updates < 3 THEN
        -- Log social links addition (prioritize this over general profile update)
        IF has_social_changes THEN
            PERFORM public.create_activity_log(
                'social_links_added',
                NEW.user_id,
                NULL, NULL, NULL, NULL,
                NEW.user_id,
                '{}'::jsonb,
                'low_priority'
            );
        ELSIF has_profile_changes THEN
            PERFORM public.create_activity_log(
                'profile_updated',
                NEW.user_id,
                NULL, NULL, NULL, NULL,
                NEW.user_id,
                '{}'::jsonb,
                'low_priority'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create index for spam prevention queries (performance optimization)
CREATE INDEX IF NOT EXISTS idx_activity_log_spam_check
ON public.activity_log(actor_user_id, target_startsnap_id, activity_type, created_at)
WHERE activity_type IN ('project_supported', 'project_unsupported', 'profile_updated', 'social_links_added');

-- Add monitoring view for spam detection
CREATE OR REPLACE VIEW public.activity_spam_monitoring AS
SELECT
    actor_user_id,
    target_startsnap_id,
    activity_type,
    COUNT(*) as activity_count,
    COUNT(*) FILTER (WHERE metadata->>'spam_prevented' = 'true') as spam_prevented_count,
    MIN(created_at) as first_activity,
    MAX(created_at) as last_activity
FROM public.activity_log
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND activity_type IN ('project_supported', 'project_unsupported')
GROUP BY actor_user_id, target_startsnap_id, activity_type
HAVING COUNT(*) > 1
ORDER BY activity_count DESC;

-- Grant access to monitoring view
GRANT SELECT ON public.activity_spam_monitoring TO authenticated;