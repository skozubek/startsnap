/*
  # Add foreign key relationship between startsnaps and profiles
  
  1. Changes
    - Add foreign key constraint from startsnaps.user_id to profiles.user_id
  
  2. Notes
    - This establishes the proper relationship for joins between startsnaps and profiles
    - Uses the user_id field which already exists in both tables
*/

-- Add foreign key constraint from startsnaps to profiles
ALTER TABLE public.startsnaps
ADD CONSTRAINT startsnaps_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id)
ON DELETE CASCADE;