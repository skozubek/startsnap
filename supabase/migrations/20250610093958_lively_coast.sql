/*
  # Add Screenshot Support to StartSnaps

  1. New Columns
    - `screenshot_urls` (text[], nullable) - Array of screenshot URLs for each StartSnap project

  2. Storage Bucket
    - Create `project-screenshots` bucket for storing project screenshot images

  3. Security (RLS Policies)
    - Allow authenticated users to upload screenshots
    - Allow public read access to screenshots
    - Allow users to update/delete only their own screenshots (based on folder structure)

  This migration enables users to upload and manage screenshot images for their StartSnap projects.
*/

-- Add screenshot_urls column to startsnaps table
ALTER TABLE public.startsnaps 
ADD COLUMN IF NOT EXISTS screenshot_urls text[];

-- Create the project-screenshots storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-screenshots', 'project-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for project-screenshots bucket

-- Allow authenticated users to upload screenshots
CREATE POLICY "Allow authenticated users to upload screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-screenshots');

-- Allow public read access to screenshots
CREATE POLICY "Allow public read access to screenshots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'project-screenshots');

-- Allow users to update their own screenshots
CREATE POLICY "Allow users to update own screenshots"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'project-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own screenshots
CREATE POLICY "Allow users to delete own screenshots"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-screenshots' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);