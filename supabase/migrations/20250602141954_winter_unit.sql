/*
  # Add feedback replies support
  
  1. New Tables
    - `feedback_replies`
      - `id` (uuid, primary key)
      - `parent_feedback_id` (uuid, foreign key to feedbacks)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on feedback_replies table
    - Add policies for:
      - Public viewing
      - Authenticated users can create replies
      - Users can update/delete their own replies
  
  3. Triggers
    - Add updated_at timestamp trigger
*/

-- Create feedback_replies table
CREATE TABLE IF NOT EXISTS public.feedback_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedback_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for feedback_replies table
CREATE POLICY "Allow public viewing of feedback replies" 
  ON public.feedback_replies
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert replies" 
  ON public.feedback_replies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own replies" 
  ON public.feedback_replies
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own replies" 
  ON public.feedback_replies
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_replies_updated_at
  BEFORE UPDATE ON public.feedback_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();