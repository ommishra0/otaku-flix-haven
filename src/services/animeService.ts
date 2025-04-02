
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnimeEpisode {
  id: string;
  title: string;
  description: string;
  number: number;
  thumbnail_url: string | null;
  video_url: string | null;
  air_date?: string;
  duration?: string;
  subtitles?: {
    language: string;
    url: string;
  }[];
  quality_options?: {
    quality: string;
    url: string;
  }[];
}

export interface CastMember {
  id: string;
  name: string;
  character_name: string;
  image_url: string | null;
  role: string;
}

export interface Trailer {
  id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
}

export interface Rating {
  id: string;
  system: string;
  value: string;
}

// Fetch anime details with episodes, cast, trailers, and ratings
export const fetchAnimeFullDetails = async (animeId: string) => {
  try {
    // Fetch anime details
    const { data: anime, error: animeError } = await supabase
      .from('anime')
      .select(`
        *,
        genres:anime_genres(
          genres(name)
        )
      `)
      .eq('id', animeId)
      .single();

    if (animeError) throw animeError;

    // Format genres
    const formattedGenres = anime?.genres
      ?.map((g: any) => g.genres?.name)
      .filter(Boolean) || [];

    // Return formatted anime with related data
    return {
      ...anime,
      genres: formattedGenres
    };
  } catch (error) {
    console.error('Error fetching anime details:', error);
    toast.error('Failed to load anime details');
    return null;
  }
};

// Fetch episodes with pagination
export const fetchAnimeEpisodes = async (animeId: string, page = 1, limit = 12) => {
  try {
    // Calculate the start and end range for the query
    const start = (page - 1) * limit;
    const end = start + limit - 1;
    
    // Fetch episodes with pagination
    const { data, error, count } = await supabase
      .from('episodes')
      .select('*', { count: 'exact' })
      .eq('anime_id', animeId)
      .order('number', { ascending: true })
      .range(start, end);
    
    if (error) throw error;
    
    return { 
      episodes: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: count ? Math.ceil(count / limit) : 0
    };
  } catch (error) {
    console.error('Error fetching episodes:', error);
    toast.error('Failed to load episodes');
    return { 
      episodes: [], 
      totalCount: 0,
      currentPage: page,
      totalPages: 0
    };
  }
};

// Fetch cast and crew data
export const fetchAnimeCast = async (animeId: string, searchQuery = '') => {
  try {
    let query = supabase
      .from('anime_cast')
      .select(`
        id,
        name,
        character_name,
        image_url,
        role
      `)
      .eq('anime_id', animeId);
    
    // Add search filter if provided
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,character_name.ilike.%${searchQuery}%`);
    }
    
    const { data, error } = await query.order('role', { ascending: true });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching cast data:', error);
    toast.error('Failed to load cast information');
    return [];
  }
};

// Fetch trailers
export const fetchAnimeTrailers = async (animeId: string) => {
  try {
    const { data, error } = await supabase
      .from('anime_trailers')
      .select('*')
      .eq('anime_id', animeId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching trailers:', error);
    toast.error('Failed to load trailers');
    return [];
  }
};

// Fetch ratings
export const fetchAnimeRatings = async (animeId: string) => {
  try {
    const { data, error } = await supabase
      .from('anime_ratings')
      .select('*')
      .eq('anime_id', animeId);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching ratings:', error);
    toast.error('Failed to load ratings');
    return [];
  }
};

// Update episode with new streaming URLs and subtitle info
export const updateEpisodeStreamingInfo = async (
  episodeId: string,
  streamingUrl: string,
  subtitles: { language: string; url: string }[],
  qualityOptions: { quality: string; url: string }[]
) => {
  try {
    const { error } = await supabase
      .from('episodes')
      .update({
        video_url: streamingUrl,
        subtitles: subtitles,
        quality_options: qualityOptions,
        updated_at: new Date().toISOString()
      })
      .eq('id', episodeId);
    
    if (error) throw error;
    
    toast.success('Episode streaming information updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating episode streaming info:', error);
    toast.error('Failed to update streaming information');
    return false;
  }
};
