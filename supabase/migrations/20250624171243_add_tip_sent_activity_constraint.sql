-- Migration: Add tip_sent to activity_type CHECK constraint
-- This properly extends the database constraint to allow tip_sent activity type

-- Drop the existing CHECK constraint
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_activity_type_check;

-- Add the new CHECK constraint with tip_sent included
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_activity_type_check
CHECK (activity_type IN (
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
    'feedback_reply_added',

    -- Algorand tipping
    'tip_sent'
));

-- Drop the existing target validation constraint
ALTER TABLE public.activity_log DROP CONSTRAINT IF EXISTS activity_log_valid_target;

-- Add the updated constraint validation with tip_sent logic
ALTER TABLE public.activity_log ADD CONSTRAINT activity_log_valid_target
CHECK (
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
        WHEN 'tip_sent' THEN target_startsnap_id IS NOT NULL
        ELSE FALSE
    END
);