-- Create the vibe_requests table
CREATE TABLE public.vibe_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tags TEXT[] NULLABLE,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in progress', 'completed')),
    type TEXT DEFAULT 'request' CHECK (type IN ('request', 'challenge')),
    linked_startsnap_id UUID NULLABLE REFERENCES public.startsnaps(id) ON DELETE SET NULL
);

-- Enable RLS for the vibe_requests table
ALTER TABLE public.vibe_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vibe_requests

-- 1. Allow public read access to vibe_requests
CREATE POLICY "Allow public read access to vibe_requests"
ON public.vibe_requests
FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert vibe_requests
CREATE POLICY "Allow authenticated users to insert vibe_requests"
ON public.vibe_requests
FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

-- 3. Allow users to update their own vibe_requests
CREATE POLICY "Allow users to update their own vibe_requests"
ON public.vibe_requests
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to delete their own vibe_requests
CREATE POLICY "Allow users to delete their own vibe_requests"
ON public.vibe_requests
FOR DELETE
USING (auth.uid() = user_id);
