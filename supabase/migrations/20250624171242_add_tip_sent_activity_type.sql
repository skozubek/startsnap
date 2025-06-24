-- Migration: Add tip_sent activity type to create_activity_log function
-- This extends the existing function to handle Algorand tipping activities

-- Update the create_activity_log function to include tip_sent activity type
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
    tip_amount text;
    tip_currency text;
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
    tip_amount := p_metadata->>'tip_amount';
    tip_currency := COALESCE(p_metadata->>'currency', 'ALGO'); -- Default to ALGO for backward compatibility

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

        -- Algorand tipping (supports both ALGO and USDC)
        WHEN 'tip_sent' THEN
            computed_display_text := actor_username || ' just tipped ' || tip_amount || ' ' || tip_currency || ' to ' || project_name || ' 💰';
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