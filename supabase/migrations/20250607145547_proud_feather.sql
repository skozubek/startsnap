/*
  # Update handle_new_user function for username uniqueness

  1. Function Updates
    - Modified `handle_new_user` function to handle username conflicts
    - Automatically appends random suffix when username already exists
    - Ensures unique usernames during signup process

  2. Changes
    - Added logic to check for existing usernames
    - Implemented random suffix generation using md5 hash
    - Added WHILE loop to ensure uniqueness (safeguard against collisions)
*/

-- Drop the existing function first
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the updated function with username uniqueness handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initial_username TEXT;
  unique_username TEXT;
  random_suffix TEXT;
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

  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, unique_username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is still properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();