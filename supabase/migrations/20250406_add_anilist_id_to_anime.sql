
-- Check if the column already exists before adding it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'anime' 
          AND column_name = 'anilist_id'
    ) THEN
        -- Add the anilist_id column if it doesn't exist
        ALTER TABLE public.anime 
        ADD COLUMN anilist_id INTEGER;
        
        -- Add an index for faster lookups by anilist_id
        CREATE INDEX idx_anime_anilist_id ON public.anime(anilist_id);
    END IF;
END $$;
