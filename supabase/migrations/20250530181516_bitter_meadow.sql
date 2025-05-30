-- Create startsnaps table
CREATE TABLE IF NOT EXISTS public.startsnaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT NOT NULL DEFAULT 'idea', -- 'idea' or 'live'
  thumbnail_url TEXT,
  live_demo_url TEXT,
  demo_video_url TEXT,
  tools_used TEXT[], -- Array of tools/frameworks used
  feedback_tags TEXT[], -- Array of areas seeking feedback on
  is_hackathon_entry BOOLEAN DEFAULT false,
  tags TEXT[], -- General tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vibe logs table for project updates
CREATE TABLE IF NOT EXISTS public.vibelogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  startsnap_id UUID REFERENCES public.startsnaps(id) ON DELETE CASCADE NOT NULL,
  log_type TEXT NOT NULL, -- 'launch', 'update', 'feature', 'idea', 'feedback'
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on both tables
ALTER TABLE public.startsnaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibelogs ENABLE ROW LEVEL SECURITY;

-- Policies for startsnaps
CREATE POLICY "Allow public viewing of startsnaps" ON public.startsnaps
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own startsnaps" ON public.startsnaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own startsnaps" ON public.startsnaps
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own startsnaps" ON public.startsnaps
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for vibelogs
CREATE POLICY "Allow public viewing of vibelogs" ON public.vibelogs
  FOR SELECT USING (true);

CREATE POLICY "Allow users to insert vibelogs on their own startsnaps" ON public.vibelogs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.startsnaps 
      WHERE id = vibelogs.startsnap_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update vibelogs on their own startsnaps" ON public.vibelogs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.startsnaps 
      WHERE id = vibelogs.startsnap_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to delete vibelogs on their own startsnaps" ON public.vibelogs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.startsnaps 
      WHERE id = vibelogs.startsnap_id AND user_id = auth.uid()
    )
  );

-- Create triggers to handle created_at and updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_startsnaps_updated_at
BEFORE UPDATE ON public.startsnaps
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vibelogs_updated_at
BEFORE UPDATE ON public.vibelogs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();