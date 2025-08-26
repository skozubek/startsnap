--
-- DB-level trigger to call Edge Function on new feedback insert
-- Requires: pg_net extension and two Vault secrets
--   - EDGE_FUNCTION_BASE_URL: e.g. https://<PROJECT-REF>.functions.supabase.co
--   - EDGE_FUNCTION_JWT: Bearer token for Edge Function auth (use anon JWT or dedicated key)
--

-- Ensure required extensions are available (Supabase managed)
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Create a secure trigger function that posts to the Edge Function
create or replace function public.trigger_call_notify_new_feedback()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_url text;
  auth_token text;
  endpoint text;
  response json;
begin
  -- Read secrets from Supabase Vault (must be set by admin prior to use)
  -- Note: the field is 'plaintext' (not 'plain_text')
  select (vault.get_secret('EDGE_FUNCTION_BASE_URL'::text)->>'plaintext') into base_url;
  select (vault.get_secret('EDGE_FUNCTION_JWT'::text)->>'plaintext') into auth_token;

  if base_url is null or base_url = '' then
    raise warning 'EDGE_FUNCTION_BASE_URL secret is not set; skipping notify-new-feedback call';
    return new;
  end if;
  if auth_token is null or auth_token = '' then
    raise warning 'EDGE_FUNCTION_JWT secret is not set; skipping notify-new-feedback call';
    return new;
  end if;

  endpoint := base_url || '/notify-new-feedback';

  -- Fire-and-forget HTTP request to the Edge Function
  perform net.http_post(
    url := endpoint,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || auth_token
    ),
    body := json_build_object('feedback_id', NEW.id)::text
  );

  return new;
end;
$$;

-- Drop and recreate trigger to ensure idempotency
drop trigger if exists trg_feedbacks_notify_new on public.feedbacks;

create trigger trg_feedbacks_notify_new
after insert on public.feedbacks
for each row
execute function public.trigger_call_notify_new_feedback();


