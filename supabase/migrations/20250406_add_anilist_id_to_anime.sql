
ALTER TABLE public.anime 
ADD COLUMN anilist_id INTEGER;

-- Add an index for faster lookups by anilist_id
CREATE INDEX idx_anime_anilist_id ON public.anime(anilist_id);
