set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_support_milestone(p_startsnap_id uuid, p_new_count integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    project_owner_id uuid;
BEGIN
    -- Get project owner
    SELECT user_id INTO project_owner_id
    FROM public.startsnaps
    WHERE id = p_startsnap_id;

    -- Check for milestone achievements (10, 25, 50, 100, 250, 500, 1000)
    IF p_new_count IN (10, 25, 50, 100, 250, 500, 1000) THEN
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
    END IF;
END;
$function$
;


