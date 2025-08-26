-- Add X-Function-Signature header to notify-new-feedback trigger HTTP call
-- Replace '__SIGNATURE_TOKEN__' before running if you prefer to inline it,
-- or edit this migration after generating a token.

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
  endpoint   text := 'https://clbqzchawfyaixwnkbgi.functions.supabase.co/notify-new-feedback';
  auth_token text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsYnF6Y2hhd2Z5YWl4d25rYmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTU0OTEsImV4cCI6MjA2NDE5MTQ5MX0.B3D85OfpKsqYFf5tolzj2kKuVY7GbBjTFJZJlxC-7l4';  -- keep anon
  sig_header text := 'r9*au3vBTMkZYxdpZ#brkZ47s&JrPG7^CVNM7wPRuDZchYzmsRrmGwfRmFmwS%T2';     -- set a strong random token
  body_j     jsonb;
  params_j   jsonb := '{}'::jsonb;
  headers_j  jsonb;
  timeout_ms integer := 5000;
begin
  body_j := jsonb_build_object('feedback_id', NEW.id);
  headers_j := jsonb_build_object(
    'Content-Type','application/json',
    'Authorization','Bearer ' || auth_token,
    'X-Function-Signature', sig_header
  );

  perform net.http_post(endpoint, body_j, params_j, headers_j, timeout_ms);
  return NEW;
end;
$$;

create trigger trg_feedbacks_notify_new
after insert on public.feedbacks
for each row
execute function public.trigger_call_notify_new_feedback();


