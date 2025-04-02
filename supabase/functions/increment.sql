
-- Create function to increment a value
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement a value
CREATE OR REPLACE FUNCTION decrement(x integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, x - 1);
END;
$$ LANGUAGE plpgsql;

-- Create a function to add a quality option to an episode
CREATE OR REPLACE FUNCTION add_quality_option(
  episode_id UUID,
  quality TEXT,
  label TEXT,
  url TEXT
) RETURNS JSONB AS $$
DECLARE
  current_options JSONB;
  new_option JSONB;
BEGIN
  -- Get current quality options
  SELECT quality_options INTO current_options FROM episodes WHERE id = episode_id;
  
  -- Create new option
  new_option := jsonb_build_object(
    'quality', quality,
    'label', label,
    'url', url
  );
  
  -- If no options yet, create array with new option
  IF current_options IS NULL THEN
    current_options := jsonb_build_array(new_option);
  ELSE
    -- Add new option to array
    current_options := current_options || new_option;
  END IF;
  
  -- Update episode
  UPDATE episodes SET quality_options = current_options WHERE id = episode_id;
  
  RETURN current_options;
END;
$$ LANGUAGE plpgsql;

-- Create a function to add a subtitle to an episode
CREATE OR REPLACE FUNCTION add_subtitle(
  episode_id UUID,
  language TEXT,
  label TEXT,
  url TEXT
) RETURNS JSONB AS $$
DECLARE
  current_subtitles JSONB;
  new_subtitle JSONB;
BEGIN
  -- Get current subtitles
  SELECT subtitles INTO current_subtitles FROM episodes WHERE id = episode_id;
  
  -- Create new subtitle
  new_subtitle := jsonb_build_object(
    'language', language,
    'label', label,
    'url', url
  );
  
  -- If no subtitles yet, create array with new subtitle
  IF current_subtitles IS NULL THEN
    current_subtitles := jsonb_build_array(new_subtitle);
  ELSE
    -- Add new subtitle to array
    current_subtitles := current_subtitles || new_subtitle;
  END IF;
  
  -- Update episode
  UPDATE episodes SET subtitles = current_subtitles WHERE id = episode_id;
  
  RETURN current_subtitles;
END;
$$ LANGUAGE plpgsql;
