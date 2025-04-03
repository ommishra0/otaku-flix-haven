
-- Drop any existing RLS policies for episodes table
DROP POLICY IF EXISTS "Anyone can read episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admin users can insert episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admin users can update episodes" ON public.episodes;
DROP POLICY IF EXISTS "Admin users can delete episodes" ON public.episodes;

-- Temporarily disable RLS to ensure we can make changes
ALTER TABLE public.episodes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create policy that allows public read access to episodes
CREATE POLICY "Anyone can read episodes" 
  ON public.episodes 
  FOR SELECT 
  USING (true);

-- Create policy that allows authenticated users to create episodes
CREATE POLICY "Authenticated users can insert episodes" 
  ON public.episodes 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Create policy that allows authenticated users to update episodes
CREATE POLICY "Authenticated users can update episodes" 
  ON public.episodes 
  FOR UPDATE 
  TO authenticated 
  USING (true);

-- Create policy that allows authenticated users to delete episodes
CREATE POLICY "Authenticated users can delete episodes" 
  ON public.episodes 
  FOR DELETE 
  TO authenticated 
  USING (true);
