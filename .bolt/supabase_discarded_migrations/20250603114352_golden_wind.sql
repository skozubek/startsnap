/*
  # Establish relationship between startsnaps and profiles tables
  
  1. New Tables
    - Ensures profiles table exists
    - Ensures startsnaps table exists
    - Adds foreign key constraint
  
  2. Changes
    - Creates profiles table if it doesn't exist
    - Creates startsnaps table if it doesn't exist
    - Establishes foreign key relationship
    
  3. Security
    - Enables RLS on both tables
    - Adds basic security policies
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username text UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Create startsnaps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.startsnaps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    type text,
    is_hackathon_entry boolean DEFAULT false,
    tags text[],
    tools_used text[],
    support_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT startsnaps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startsnaps ENABLE ROW LEVEL SECURITY;

-- Add basic security policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Users can read all startsnaps"
    ON public.startsnaps
    FOR SELECT
    TO public
    USING (true);