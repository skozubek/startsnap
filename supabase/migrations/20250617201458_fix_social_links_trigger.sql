/**
 * supabase/migrations/20250617201458_fix_social_links_trigger.sql
 * 
 * Fix: Social Links Trigger False Positive
 * 
 * Problem: social_links_added was being logged when only bio was updated
 * Solution: Only log social_links_added when URLs actually change from empty to filled
 */

-- Drop and recreate the profile update trigger with smarter logic
DROP TRIGGER IF EXISTS trigger_log_profile_updated ON public.profiles;

CREATE OR REPLACE FUNCTION public.log_profile_updated() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    has_social_changes boolean := false;
    has_profile_changes boolean := false;
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
    
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_log_profile_updated
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_updated();