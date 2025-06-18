/**
 * supabase/migrations/20250610095225_comprehensive_activity_log_system.sql
 *
 * Comprehensive Activity Log System Migration
 *
 * Creates the foundation for the live activity feed that captures the full spectrum
 * of meaningful community activity including:
 * - New project launches & updates
 * - Vibe log updates & vibe requests
 * - User support actions & milestones
 * - New user registrations & status changes
 * - Feedback submissions & replies
 * - Profile updates & enhancements
 * - Project evolution (idea → prototype → live)
 */

-- Create activity_log table with comprehensive activity types
CREATE TABLE IF NOT EXISTS public.activity_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Core activity data
    activity_type text NOT NULL CHECK (activity_type IN (
        -- Project lifecycle
        'project_created',
        'project_updated',
        'project_type_evolved',        -- idea → prototype → live
        'project_tools_updated',
        'project_category_changed',
        'project_tags_updated',

        -- Vibe logs & requests
        'vibe_log_added',
        'vibe_log_updated',
        'vibe_request_created',
        'vibe_request_completed',

        -- User lifecycle & engagement
        'user_joined',
        'user_status_changed',         -- brainstorming → building → shipping
        'profile_updated',
        'social_links_added',

        -- Community interactions
        'project_supported',
        'project_unsupported',
        'support_milestone_reached',   -- 10, 25, 50, 100 supporters
        'feedback_added',
        'feedback_reply_added'
    )),

    -- Actor (who performed the action)
    actor_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Target resources (what was acted upon)
    target_startsnap_id uuid REFERENCES public.startsnaps(id) ON DELETE CASCADE,
    target_vibe_log_id uuid REFERENCES public.vibelogs(id) ON DELETE CASCADE,
    target_vibe_request_id uuid REFERENCES public.vibe_requests(id) ON DELETE CASCADE,
    target_feedback_id uuid REFERENCES public.feedbacks(id) ON DELETE CASCADE,
    target_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- For user events

    -- Activity metadata (flexible JSON for activity-specific data)
    metadata jsonb DEFAULT '{}',

    -- Computed display text (for performance - pre-rendered activity descriptions)
    display_text text,

    -- Visibility control (some activities might be less prominent)
    visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'low_priority', 'hidden')),

    -- Timestamps
    created_at timestamp with time zone DEFAULT now() NOT NULL,

    -- Constraint to ensure proper target references
    CONSTRAINT activity_log_valid_target CHECK (
        CASE activity_type
            WHEN 'user_joined' THEN target_user_id IS NOT NULL
            WHEN 'user_status_changed' THEN target_user_id IS NOT NULL
            WHEN 'profile_updated' THEN target_user_id IS NOT NULL
            WHEN 'social_links_added' THEN target_user_id IS NOT NULL
            WHEN 'project_created' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_updated' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_type_evolved' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_tools_updated' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_category_changed' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_tags_updated' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_supported' THEN target_startsnap_id IS NOT NULL
            WHEN 'project_unsupported' THEN target_startsnap_id IS NOT NULL
            WHEN 'support_milestone_reached' THEN target_startsnap_id IS NOT NULL
            WHEN 'vibe_log_added' THEN target_startsnap_id IS NOT NULL AND target_vibe_log_id IS NOT NULL
            WHEN 'vibe_log_updated' THEN target_startsnap_id IS NOT NULL AND target_vibe_log_id IS NOT NULL
            WHEN 'vibe_request_created' THEN target_vibe_request_id IS NOT NULL
            WHEN 'vibe_request_completed' THEN target_vibe_request_id IS NOT NULL
            WHEN 'feedback_added' THEN target_startsnap_id IS NOT NULL AND target_feedback_id IS NOT NULL
            WHEN 'feedback_reply_added' THEN target_startsnap_id IS NOT NULL AND target_feedback_id IS NOT NULL
            ELSE FALSE
        END
    )
);

-- Create indexes for efficient querying
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_activity_type ON public.activity_log(activity_type);
CREATE INDEX idx_activity_log_visibility ON public.activity_log(visibility);
CREATE INDEX idx_activity_log_actor ON public.activity_log(actor_user_id);
CREATE INDEX idx_activity_log_startsnap ON public.activity_log(target_startsnap_id) WHERE target_startsnap_id IS NOT NULL;

-- Composite index for feed queries
CREATE INDEX idx_activity_log_public_feed ON public.activity_log(visibility, created_at DESC) WHERE visibility = 'public';

-- Enable RLS
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow everyone to read public activity logs
CREATE POLICY "Allow public read access to activity logs"
ON public.activity_log
FOR SELECT
TO public
USING (visibility = 'public');

-- Enhanced function to create activity log entries with smart display text generation
CREATE OR REPLACE FUNCTION public.create_activity_log(
    p_activity_type text,
    p_actor_user_id uuid,
    p_target_startsnap_id uuid DEFAULT NULL,
    p_target_vibe_log_id uuid DEFAULT NULL,
    p_target_vibe_request_id uuid DEFAULT NULL,
    p_target_feedback_id uuid DEFAULT NULL,
    p_target_user_id uuid DEFAULT NULL,
    p_metadata jsonb DEFAULT '{}',
    p_visibility text DEFAULT 'public'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    activity_id uuid;
    actor_username text;
    project_name text;
    vibe_log_title text;
    vibe_request_title text;
    target_username text;
    computed_display_text text;
    old_value text;
    new_value text;
    milestone_count integer;
BEGIN
    -- Get actor username
    SELECT username INTO actor_username
    FROM public.profiles
    WHERE user_id = p_actor_user_id;

    -- Get project name if applicable
    IF p_target_startsnap_id IS NOT NULL THEN
        SELECT name INTO project_name
        FROM public.startsnaps
        WHERE id = p_target_startsnap_id;
    END IF;

    -- Get vibe log title if applicable
    IF p_target_vibe_log_id IS NOT NULL THEN
        SELECT title INTO vibe_log_title
        FROM public.vibelogs
        WHERE id = p_target_vibe_log_id;
    END IF;

    -- Get vibe request title if applicable
    IF p_target_vibe_request_id IS NOT NULL THEN
        SELECT title INTO vibe_request_title
        FROM public.vibe_requests
        WHERE id = p_target_vibe_request_id;
    END IF;

    -- Get target username if applicable
    IF p_target_user_id IS NOT NULL THEN
        SELECT username INTO target_username
        FROM public.profiles
        WHERE user_id = p_target_user_id;
    END IF;

    -- Extract metadata values for display text
    old_value := p_metadata->>'old_value';
    new_value := p_metadata->>'new_value';
    milestone_count := (p_metadata->>'milestone_count')::integer;

    -- Generate display text based on activity type
    CASE p_activity_type
        -- Project lifecycle
        WHEN 'project_created' THEN
            computed_display_text := actor_username || ' just launched a new project: ' || project_name;
        WHEN 'project_updated' THEN
            computed_display_text := actor_username || ' updated their project: ' || project_name;
        WHEN 'project_type_evolved' THEN
            computed_display_text := actor_username || '''s project ' || project_name || ' evolved from ' || old_value || ' to ' || new_value || ' 🚀';
        WHEN 'project_tools_updated' THEN
            computed_display_text := actor_username || ' updated the tech stack for ' || project_name;
        WHEN 'project_category_changed' THEN
            computed_display_text := actor_username || ' moved ' || project_name || ' to the ' || new_value || ' category';
        WHEN 'project_tags_updated' THEN
            computed_display_text := actor_username || ' refined the tags for ' || project_name;

        -- Vibe logs & requests
        WHEN 'vibe_log_added' THEN
            computed_display_text := actor_username || ' just added a new Vibe Log to ' || project_name || ': "' || vibe_log_title || '"';
        WHEN 'vibe_log_updated' THEN
            computed_display_text := actor_username || ' updated a Vibe Log in ' || project_name || ': "' || vibe_log_title || '"';
        WHEN 'vibe_request_created' THEN
            computed_display_text := actor_username || ' created a new vibe request: "' || vibe_request_title || '"';
        WHEN 'vibe_request_completed' THEN
            computed_display_text := 'Vibe request completed: "' || vibe_request_title || '"';

        -- User lifecycle & engagement
        WHEN 'user_joined' THEN
            computed_display_text := target_username || ' just joined the community. Welcome! 👋';
        WHEN 'user_status_changed' THEN
            computed_display_text := target_username || ' changed status from ' || old_value || ' to ' || new_value;
        WHEN 'profile_updated' THEN
            computed_display_text := target_username || ' updated their profile';
        WHEN 'social_links_added' THEN
            computed_display_text := target_username || ' added new social links to their profile';

        -- Community interactions
        WHEN 'project_supported' THEN
            computed_display_text := actor_username || ' just supported ' || project_name || ' ❤️';
        WHEN 'project_unsupported' THEN
            computed_display_text := actor_username || ' withdrew support from ' || project_name;
        WHEN 'support_milestone_reached' THEN
            computed_display_text := project_name || ' just reached ' || milestone_count || ' supporters! 🎉';
        WHEN 'feedback_added' THEN
            computed_display_text := actor_username || ' left feedback on ' || project_name;
        WHEN 'feedback_reply_added' THEN
            computed_display_text := actor_username || ' replied to feedback on ' || project_name;
        ELSE
            computed_display_text := 'Unknown activity';
    END CASE;

    -- Insert the activity log entry
    INSERT INTO public.activity_log (
        activity_type,
        actor_user_id,
        target_startsnap_id,
        target_vibe_log_id,
        target_vibe_request_id,
        target_feedback_id,
        target_user_id,
        metadata,
        display_text,
        visibility
    ) VALUES (
        p_activity_type,
        p_actor_user_id,
        p_target_startsnap_id,
        p_target_vibe_log_id,
        p_target_vibe_request_id,
        p_target_feedback_id,
        p_target_user_id,
        p_metadata,
        computed_display_text,
        p_visibility
    ) RETURNING id INTO activity_id;

    RETURN activity_id;
END;
$$;

-- Function to check and log support milestones
CREATE OR REPLACE FUNCTION public.check_support_milestone(p_startsnap_id uuid, p_new_count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    project_owner_id uuid;
BEGIN
    -- Get project owner
    SELECT user_id INTO project_owner_id
    FROM public.startsnaps
    WHERE id = p_startsnap_id;

        -- Check for milestone achievements (10, 25, 50, 100, 250, 500, 1000)
    IF p_new_count IN (10, 25, 50, 100, 250, 500, 1000) THEN
        -- Use the create_activity_log function to properly generate display_text
        PERFORM public.create_activity_log(
            'support_milestone_reached',
            project_owner_id,
            p_startsnap_id,
            NULL,
            NULL,
            NULL,
            NULL,
            jsonb_build_object('milestone_count', p_new_count),
            'public'
        );

        -- Update the created_at timestamp to be 1 second later for proper ordering
        UPDATE public.activity_log
        SET created_at = NOW() + INTERVAL '1 second'
        WHERE id = (
            SELECT id FROM public.activity_log
            WHERE activity_type = 'support_milestone_reached'
              AND target_startsnap_id = p_startsnap_id
              AND (metadata->>'milestone_count')::integer = p_new_count
            ORDER BY created_at DESC
            LIMIT 1
        );
    END IF;
END;
$$;

-- =====================================
-- AUTOMATIC TRIGGERS FOR ACTIVITY LOGGING
-- =====================================

-- 1. USER LIFECYCLE TRIGGERS

-- Trigger: Log new user registrations
CREATE OR REPLACE FUNCTION public.log_user_joined() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    PERFORM public.create_activity_log(
        'user_joined',
        NEW.user_id,
        NULL, NULL, NULL, NULL,
        NEW.user_id,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_user_joined
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_joined();

-- Trigger: Log user status changes
CREATE OR REPLACE FUNCTION public.log_user_status_changed() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM public.create_activity_log(
            'user_status_changed',
            NEW.user_id,
            NULL, NULL, NULL, NULL,
            NEW.user_id,
            jsonb_build_object('old_value', OLD.status, 'new_value', NEW.status)
        );
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_user_status_changed
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_user_status_changed();

-- Trigger: Log profile updates (bio, social links)
CREATE OR REPLACE FUNCTION public.log_profile_updated() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    has_social_changes boolean := false;
    has_profile_changes boolean := false;
BEGIN
    -- Check for social link changes
    IF (OLD.github_url IS DISTINCT FROM NEW.github_url) OR
       (OLD.twitter_url IS DISTINCT FROM NEW.twitter_url) OR
       (OLD.linkedin_url IS DISTINCT FROM NEW.linkedin_url) OR
       (OLD.website_url IS DISTINCT FROM NEW.website_url) THEN
        has_social_changes := true;
    END IF;

    -- Check for other profile changes
    IF (OLD.bio IS DISTINCT FROM NEW.bio) OR
       (OLD.username IS DISTINCT FROM NEW.username) THEN
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
            'low_priority'  -- Less prominent
        );
    ELSIF has_profile_changes THEN
        PERFORM public.create_activity_log(
            'profile_updated',
            NEW.user_id,
            NULL, NULL, NULL, NULL,
            NEW.user_id,
            '{}'::jsonb,
            'low_priority'  -- Less prominent
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_profile_updated
    AFTER UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.log_profile_updated();

-- 2. PROJECT LIFECYCLE TRIGGERS

-- Trigger: Log project creation
CREATE OR REPLACE FUNCTION public.log_project_created() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    PERFORM public.create_activity_log(
        'project_created',
        NEW.user_id,
        NEW.id,
        NULL, NULL, NULL, NULL,
        jsonb_build_object('category', NEW.category, 'type', NEW.type)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_project_created
    AFTER INSERT ON public.startsnaps
    FOR EACH ROW
    EXECUTE FUNCTION public.log_project_created();

-- Trigger: Log project updates
CREATE OR REPLACE FUNCTION public.log_project_updated() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    has_meaningful_changes boolean := false;
BEGIN
    -- Check for meaningful changes that warrant activity logging
    IF (OLD.name IS DISTINCT FROM NEW.name) OR
       (OLD.description IS DISTINCT FROM NEW.description) OR
       (OLD.category IS DISTINCT FROM NEW.category) OR
       (OLD.type IS DISTINCT FROM NEW.type) OR
       (OLD.tools_used IS DISTINCT FROM NEW.tools_used) OR
       (OLD.tags IS DISTINCT FROM NEW.tags) OR
       (OLD.live_demo_url IS DISTINCT FROM NEW.live_demo_url) OR
       (OLD.demo_video_url IS DISTINCT FROM NEW.demo_video_url) THEN
        has_meaningful_changes := true;
    END IF;

    IF has_meaningful_changes THEN
        -- Log specific type evolution (higher priority)
        IF OLD.type IS DISTINCT FROM NEW.type THEN
            PERFORM public.create_activity_log(
                'project_type_evolved',
                NEW.user_id,
                NEW.id,
                NULL, NULL, NULL, NULL,
                jsonb_build_object('old_value', OLD.type, 'new_value', NEW.type)
            );
        END IF;

        -- Log category changes
        IF OLD.category IS DISTINCT FROM NEW.category THEN
            PERFORM public.create_activity_log(
                'project_category_changed',
                NEW.user_id,
                NEW.id,
                NULL, NULL, NULL, NULL,
                jsonb_build_object('old_value', OLD.category, 'new_value', NEW.category),
                'low_priority'
            );
        END IF;

        -- Log tools updates
        IF OLD.tools_used IS DISTINCT FROM NEW.tools_used THEN
            PERFORM public.create_activity_log(
                'project_tools_updated',
                NEW.user_id,
                NEW.id,
                NULL, NULL, NULL, NULL,
                jsonb_build_object('tools', NEW.tools_used),
                'low_priority'
            );
        END IF;

        -- Log tags updates
        IF OLD.tags IS DISTINCT FROM NEW.tags AND NOT (OLD.type IS DISTINCT FROM NEW.type) THEN
            PERFORM public.create_activity_log(
                'project_tags_updated',
                NEW.user_id,
                NEW.id,
                NULL, NULL, NULL, NULL,
                jsonb_build_object('tags', NEW.tags),
                'low_priority'
            );
        END IF;

        -- Log general project update (lower priority, only if no specific updates logged)
        IF NOT (OLD.type IS DISTINCT FROM NEW.type) AND
           NOT (OLD.category IS DISTINCT FROM NEW.category) AND
           NOT (OLD.tools_used IS DISTINCT FROM NEW.tools_used) AND
           NOT (OLD.tags IS DISTINCT FROM NEW.tags) THEN
            PERFORM public.create_activity_log(
                'project_updated',
                NEW.user_id,
                NEW.id,
                NULL, NULL, NULL, NULL,
                '{}'::jsonb,
                'low_priority'
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_project_updated
    AFTER UPDATE ON public.startsnaps
    FOR EACH ROW
    EXECUTE FUNCTION public.log_project_updated();

-- 3. VIBE LOG TRIGGERS

-- Trigger: Log vibe log creation
CREATE OR REPLACE FUNCTION public.log_vibe_log_added() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    project_owner_id uuid;
BEGIN
    SELECT user_id INTO project_owner_id
    FROM public.startsnaps
    WHERE id = NEW.startsnap_id;

    PERFORM public.create_activity_log(
        'vibe_log_added',
        project_owner_id,
        NEW.startsnap_id,
        NEW.id,
        NULL, NULL, NULL,
        jsonb_build_object('log_type', NEW.log_type)
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_vibe_log_added
    AFTER INSERT ON public.vibelogs
    FOR EACH ROW
    EXECUTE FUNCTION public.log_vibe_log_added();

-- 4. SUPPORT & ENGAGEMENT TRIGGERS

-- Trigger: Log project support with milestone checking
CREATE OR REPLACE FUNCTION public.log_project_supported() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    new_support_count integer;
BEGIN
    -- Increment support count and get new value
    SELECT increment_support_count(NEW.startsnap_id) INTO new_support_count;

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

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_project_supported
    AFTER INSERT ON public.project_supporters
    FOR EACH ROW
    EXECUTE FUNCTION public.log_project_supported();

-- Update the existing support trigger to use the new logging
DROP TRIGGER IF EXISTS trigger_log_project_unsupported ON public.project_supporters;

CREATE OR REPLACE FUNCTION public.log_project_unsupported() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Decrement support count
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
    RETURN OLD;
END;
$$;

CREATE TRIGGER trigger_log_project_unsupported
    AFTER DELETE ON public.project_supporters
    FOR EACH ROW
    EXECUTE FUNCTION public.log_project_unsupported();

-- 5. FEEDBACK TRIGGERS

-- Trigger: Log feedback
CREATE OR REPLACE FUNCTION public.log_feedback_added() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    PERFORM public.create_activity_log(
        'feedback_added',
        NEW.user_id,
        NEW.startsnap_id,
        NULL, NULL,
        NEW.id,
        NULL,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_feedback_added
    AFTER INSERT ON public.feedbacks
    FOR EACH ROW
    EXECUTE FUNCTION public.log_feedback_added();

-- Trigger: Log feedback replies
CREATE OR REPLACE FUNCTION public.log_feedback_reply_added() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    parent_startsnap_id uuid;
BEGIN
    SELECT f.startsnap_id INTO parent_startsnap_id
    FROM public.feedbacks f
    WHERE f.id = NEW.parent_feedback_id;

    PERFORM public.create_activity_log(
        'feedback_reply_added',
        NEW.user_id,
        parent_startsnap_id,
        NULL, NULL,
        NEW.parent_feedback_id,
        NULL,
        '{}'::jsonb
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_feedback_reply_added
    AFTER INSERT ON public.feedback_replies
    FOR EACH ROW
    EXECUTE FUNCTION public.log_feedback_reply_added();

-- 6. VIBE REQUEST TRIGGERS
CREATE OR REPLACE FUNCTION public.log_vibe_request_created() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    PERFORM public.create_activity_log(
        'vibe_request_created',
        NEW.user_id,
        NEW.linked_startsnap_id,
        NULL,
        NEW.id,
        NULL, NULL,
        jsonb_build_object('type', NEW.type),
        'low_priority'
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_vibe_request_created
    AFTER INSERT ON public.vibe_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.log_vibe_request_created();

-- Enhanced activity feed view with rich metadata
CREATE OR REPLACE VIEW public.activity_feed AS
SELECT
    al.id,
    al.activity_type,
    al.display_text,
    al.created_at,
    al.metadata,
    al.visibility,

    -- Actor information
    al.actor_user_id,
    actor_profile.username as actor_username,

    -- Target startsnap information
    al.target_startsnap_id,
    startsnap.name as startsnap_name,
    startsnap.slug as startsnap_slug,
    startsnap.category as startsnap_category,
    startsnap.type as startsnap_type,

    -- Target vibe log information
    al.target_vibe_log_id,
    vibe_log.title as vibe_log_title,
    vibe_log.log_type as vibe_log_type,

    -- Target vibe request information
    al.target_vibe_request_id,
    vibe_request.title as vibe_request_title,
    vibe_request.type as vibe_request_type,

    -- Target user information (for user events)
    al.target_user_id,
    target_profile.username as target_username,
    target_profile.status as target_user_status

FROM public.activity_log al
LEFT JOIN public.profiles actor_profile ON al.actor_user_id = actor_profile.user_id
LEFT JOIN public.startsnaps startsnap ON al.target_startsnap_id = startsnap.id
LEFT JOIN public.vibelogs vibe_log ON al.target_vibe_log_id = vibe_log.id
LEFT JOIN public.vibe_requests vibe_request ON al.target_vibe_request_id = vibe_request.id
LEFT JOIN public.profiles target_profile ON al.target_user_id = target_profile.user_id
ORDER BY al.created_at DESC;

-- Grant permissions
GRANT SELECT ON public.activity_feed TO public;
GRANT SELECT ON public.activity_log TO public;

-- Create a curated feed view that filters out low-priority activities by default
CREATE OR REPLACE VIEW public.activity_feed_curated AS
SELECT * FROM public.activity_feed
WHERE visibility = 'public'
ORDER BY created_at DESC;

GRANT SELECT ON public.activity_feed_curated TO public;