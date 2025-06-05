-- Create feedbacks table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startsnap_id UUID REFERENCES public.startsnaps(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint to relate feedbacks to profiles
ALTER TABLE public.feedbacks ADD CONSTRAINT feedbacks_user_id_fkey_profiles
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Create policies for feedbacks table
CREATE POLICY "Allow public viewing of feedbacks" ON public.feedbacks
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert feedback" ON public.feedbacks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own feedback" ON public.feedbacks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own feedback" ON public.feedbacks
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to handle updated_at timestamp
CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON public.feedbacks
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();