-- Add X-Function-Signature header to notify-new-feedback trigger HTTP call
-- Uses secrets stored in Supabase Vault for secure credential management

create extension if not exists pg_net;

drop trigger if exists trg_feedbacks_notify_new on public.feedbacks;
drop function if exists public.trigger_call_notify_new_feedback();

create or replace function public.trigger_call_notify_new_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  endpoint   text;
  auth_token text;
  body_j     jsonb;
  params_j   jsonb := '{}'::jsonb;
  headers_j  jsonb;
  timeout_ms integer := 5000;
begin
  -- Retrieve secrets from Supabase Vault
  SELECT decrypted_secret INTO endpoint
  FROM vault.decrypted_secrets
  WHERE name = 'EDGE_FUNCTION_BASE_URL';

  SELECT decrypted_secret INTO auth_token
  FROM vault.decrypted_secrets
  WHERE name = 'EDGE_FUNCTION_JWT';

  -- Construct full endpoint URL
  endpoint := endpoint || '/notify-new-feedback';

  -- Build request body and headers
  body_j := jsonb_build_object('feedback_id', NEW.id);
  headers_j := jsonb_build_object(
    'Content-Type','application/json',
    'Authorization','Bearer ' || auth_token
  );

  perform net.http_post(endpoint, body_j, params_j, headers_j, timeout_ms);
  return NEW;
end;
$$;

create trigger trg_feedbacks_notify_new
after insert on public.feedbacks
for each row
execute function public.trigger_call_notify_new_feedback();


