-- Migration to add Twitter OAuth support to handle_new_user function
-- This updates the existing function to extract Twitter profile URLs

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  initial_username TEXT;
  unique_username TEXT;
  random_suffix TEXT;
  twitter_url TEXT;
BEGIN
  initial_username := SPLIT_PART(NEW.email, '@', 1);
  unique_username := initial_username;

  -- Check if the initial username exists. If so, append a random suffix.
  -- This loop is a safeguard, but it will almost always run only once.
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    -- Generate a short random string (e.g., 4-6 alphanumeric characters)
    random_suffix := substr(md5(random()::text), 1, 6);
    unique_username := initial_username || '-' || random_suffix;
  END LOOP;

  -- Extract Twitter profile URL if user signed up with Twitter
  twitter_url := NULL;
  IF NEW.raw_app_meta_data->>'provider' = 'twitter' THEN
    IF NEW.raw_user_meta_data->>'user_name' IS NOT NULL THEN
      twitter_url := 'https://twitter.com/' || (NEW.raw_user_meta_data->>'user_name');
    ELSIF NEW.raw_user_meta_data->>'preferred_username' IS NOT NULL THEN
      twitter_url := 'https://twitter.com/' || (NEW.raw_user_meta_data->>'preferred_username');
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, username, twitter_url)
  VALUES (NEW.id, unique_username, twitter_url);

  RETURN NEW;
END;
$$;