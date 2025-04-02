
import { supabase } from "@/integrations/supabase/client";

export interface Anime {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  type?: string;
  rating?: number;
  release_year?: number;
  status?: string;
  studio?: string;
  is_trending?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  genres?: string[];
  alternative_titles?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Episode {
  id: string;
  anime_id?: string;
  title: string;
  number: number;
  description?: string;
  thumbnail_url?: string;
  video_url?: string;
  embed_code?: string;
  embed_provider?: string;
  air_date?: string;
  duration?: string;
  subtitles?: Subtitle[];
  quality_options?: QualityOption[];
  created_at?: string;
  updated_at?: string;
}

export interface Subtitle {
  language: string;
  label: string;
  url: string;
}

export interface QualityOption {
  quality: string;
  label: string;
  url: string;
}

export interface CastMember {
  id: string;
  anime_id?: string;
  name: string;
  character_name?: string;
  image_url?: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

export interface Trailer {
  id: string;
  anime_id?: string;
  title: string;
  url: string;
  thumbnail_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Rating {
  id: string;
  anime_id?: string;
  system: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all anime
export const fetchAllAnime = async (): Promise<Anime[]> => {
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching anime:", error);
    return [];
  }

  return data || [];
};

// Fetch trending anime
export const fetchTrendingAnime = async (limit = 10): Promise<Anime[]> => {
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("is_trending", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching trending anime:", error);
    return [];
  }

  return data || [];
};

// Fetch popular anime
export const fetchPopularAnime = async (limit = 10): Promise<Anime[]> => {
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("is_popular", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching popular anime:", error);
    return [];
  }

  return data || [];
};

// Fetch anime by ID
export const fetchAnimeById = async (id: string): Promise<Anime | null> => {
  const { data, error } = await supabase
    .from("anime")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching anime ${id}:`, error);
    return null;
  }

  return data;
};

// Fetch episodes for an anime
export const fetchEpisodes = async (animeId: string): Promise<Episode[]> => {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("anime_id", animeId)
    .order("number", { ascending: true });

  if (error) {
    console.error(`Error fetching episodes for anime ${animeId}:`, error);
    return [];
  }

  return data || [];
};

// Add function for paginated episodes
export const fetchAnimeEpisodes = async (animeId: string, page = 1, perPage = 10): Promise<{episodes: Episode[], totalPages: number}> => {
  // Calculate the range for pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  // Fetch episodes with pagination
  const { data, error, count } = await supabase
    .from("episodes")
    .select("*", { count: 'exact' })
    .eq("anime_id", animeId)
    .order("number", { ascending: true })
    .range(from, to);
  
  if (error) {
    console.error(`Error fetching episodes for anime ${animeId}:`, error);
    return { episodes: [], totalPages: 0 };
  }
  
  // Calculate total pages
  const totalPages = count ? Math.ceil(count / perPage) : 0;
  
  return { 
    episodes: data || [], 
    totalPages 
  };
};

// Fetch a specific episode
export const fetchEpisode = async (episodeId: string): Promise<Episode | null> => {
  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("id", episodeId)
    .single();

  if (error) {
    console.error(`Error fetching episode ${episodeId}:`, error);
    return null;
  }

  return data;
};

// Fetch complete anime details including related data
export const fetchAnimeFullDetails = async (id: string): Promise<Anime | null> => {
  const { data: animeData, error: animeError } = await supabase
    .from("anime")
    .select("*")
    .eq("id", id)
    .single();

  if (animeError) {
    console.error(`Error fetching anime ${id}:`, animeError);
    return null;
  }

  if (!animeData) return null;

  // Get genres for this anime
  const { data: genreData, error: genreError } = await supabase
    .from("anime_genres")
    .select(`
      genres (
        name
      )
    `)
    .eq("anime_id", id);

  if (!genreError && genreData) {
    // Extract genre names and add to anime object
    const genres = genreData.map(g => g.genres.name);
    animeData.genres = genres;
  }

  // Get alternative titles if you have them in your database
  // This is a placeholder - adjust according to your database structure
  animeData.alternative_titles = animeData.alternative_titles || [];

  return animeData;
};

// Fetch cast for an anime
export const fetchAnimeCast = async (animeId: string, searchQuery = ""): Promise<CastMember[]> => {
  // Using fetch directly because of issues with the typed client
  const url = `${supabase.supabaseUrl}/rest/v1/anime_cast?anime_id=eq.${animeId}&order=role.asc,name.asc`;
  
  const headers = {
    'apikey': supabase.supabaseKey,
    'Authorization': `Bearer ${supabase.supabaseKey}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch cast');
    
    const data = await response.json();
    
    // Filter by search query if provided
    if (searchQuery) {
      return data.filter((member: CastMember) => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.character_name && member.character_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching cast for anime ${animeId}:`, error);
    return [];
  }
};

// Fetch trailers for an anime
export const fetchAnimeTrailers = async (animeId: string): Promise<Trailer[]> => {
  // Using fetch directly because of issues with the typed client
  const url = `${supabase.supabaseUrl}/rest/v1/anime_trailers?anime_id=eq.${animeId}`;
  
  const headers = {
    'apikey': supabase.supabaseKey,
    'Authorization': `Bearer ${supabase.supabaseKey}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch trailers');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching trailers for anime ${animeId}:`, error);
    return [];
  }
};

// Fetch ratings for an anime
export const fetchAnimeRatings = async (animeId: string): Promise<Rating[]> => {
  // Using fetch directly because of issues with the typed client
  const url = `${supabase.supabaseUrl}/rest/v1/anime_ratings?anime_id=eq.${animeId}`;
  
  const headers = {
    'apikey': supabase.supabaseKey,
    'Authorization': `Bearer ${supabase.supabaseKey}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Failed to fetch ratings');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ratings for anime ${animeId}:`, error);
    return [];
  }
};

// Add a function to update episode streaming info
export const updateEpisodeStreamingInfo = async (
  episodeId: string,
  videoUrl: string,
  subtitles: { language: string; url: string }[],
  qualityOptions: { quality: string; url: string }[]
): Promise<boolean> => {
  try {
    // Format the subtitles array for jsonb storage
    const formattedSubtitles = subtitles.map(sub => ({
      language: sub.language,
      label: sub.language, // Using language as label for now
      url: sub.url
    }));
    
    // Format the quality options array for jsonb storage
    const formattedQualityOptions = qualityOptions.map(opt => ({
      quality: opt.quality,
      label: `${opt.quality}`, // Using quality as label
      url: opt.url
    }));
    
    const { error } = await supabase
      .from("episodes")
      .update({
        video_url: videoUrl,
        subtitles: formattedSubtitles,
        quality_options: formattedQualityOptions,
        updated_at: new Date().toISOString()
      })
      .eq("id", episodeId);
    
    if (error) {
      console.error("Error updating episode streaming info:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updateEpisodeStreamingInfo:", error);
    return false;
  }
};
