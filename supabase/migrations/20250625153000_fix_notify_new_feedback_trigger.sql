-- Fix: Recreate notify-new-feedback trigger with supabase_vault enabled and correct plaintext access

-- Ensure required extensions exist
create extension if not exists pg_net;
create extension if not exists supabase_vault;

-- Drop existing trigger and function if present
drop trigger if exists trg_feedbacks_notify_new on public.feedbacks;
drop function if exists public.trigger_call_notify_new_feedback();

-- Recreate function reading secrets from Vault (plaintext) with explicit text casts
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
begin
  select (vault.get_secret('EDGE_FUNCTION_BASE_URL'::text)->>'plaintext') into base_url;
  select (vault.get_secret('EDGE_FUNCTION_JWT'::text)->>'plaintext') into auth_token;

  if coalesce(base_url, '') = '' then
    raise warning 'EDGE_FUNCTION_BASE_URL secret is not set; skipping notify-new-feedback call';
    return new;
  end if;
  if coalesce(auth_token, '') = '' then
    raise warning 'EDGE_FUNCTION_JWT secret is not set; skipping notify-new-feedback call';
    return new;
  end if;

  endpoint := base_url || '/notify-new-feedback';

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

-- Recreate trigger
create trigger trg_feedbacks_notify_new
after insert on public.feedbacks
for each row
execute function public.trigger_call_notify_new_feedback();


