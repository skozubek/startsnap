/*
  # Add project support feature
  
  1. New Tables
    - `project_supporters`
      - `startsnap_id` (uuid, FK to startsnaps)
      - `user_id` (uuid, FK to auth.users)
      - `created_at` (timestamptz)
      Composite primary key on (startsnap_id, user_id)
  
  2. Changes
    - Add support_count column to startsnaps table
  
  3. Security
    - Enable RLS on project_supporters
    - Add policies for viewing and managing support records
    - Create RPC functions for atomic support count updates
*/

-- Add support_count to startsnaps
ALTER TABLE public.startsnaps 
ADD COLUMN IF NOT EXISTS support_count INTEGER NOT NULL DEFAULT 0;

-- Create project_supporters table
CREATE TABLE IF NOT EXISTS public.project_supporters (
    startsnap_id UUID REFERENCES public.startsnaps(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY(startsnap_id, user_id)
);

-- Enable RLS
ALTER TABLE public.project_supporters ENABLE ROW LEVEL SECURITY;

-- Policies for project_supporters
CREATE POLICY "Allow public viewing of project supporters"
    ON public.project_supporters
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to support projects"
    ON public.project_supporters
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to remove their own support"
    ON public.project_supporters
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create RPC functions for atomic support count updates
CREATE OR REPLACE FUNCTION increment_support_count(p_startsnap_id uuid)
RETURNS integer
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.startsnaps
    SET support_count = support_count + 1
    WHERE id = p_startsnap_id
    RETURNING support_count INTO new_count;
    
    RETURN new_count;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_support_count(p_startsnap_id uuid)
RETURNS integer
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
    new_count integer;
BEGIN
    UPDATE public.startsnaps
    SET support_count = GREATEST(0, support_count - 1)
    WHERE id = p_startsnap_id
    RETURNING support_count INTO new_count;
    
    RETURN new_count;
END;
$$;