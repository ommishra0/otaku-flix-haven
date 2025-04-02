
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

// Fetch cast for an anime
export const fetchAnimeCast = async (animeId: string, searchQuery = ""): Promise<CastMember[]> => {
  let query = supabase
    .from("anime_cast")
    .select("*")
    .eq("anime_id", animeId)
    .order("role", { ascending: true })
    .order("name", { ascending: true });

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,character_name.ilike.%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching cast for anime ${animeId}:`, error);
    return [];
  }

  return data || [];
};

// Fetch trailers for an anime
export const fetchAnimeTrailers = async (animeId: string): Promise<Trailer[]> => {
  const { data, error } = await supabase
    .from("anime_trailers")
    .select("*")
    .eq("anime_id", animeId);

  if (error) {
    console.error(`Error fetching trailers for anime ${animeId}:`, error);
    return [];
  }

  return data || [];
};

// Fetch ratings for an anime
export const fetchAnimeRatings = async (animeId: string): Promise<Rating[]> => {
  const { data, error } = await supabase
    .from("anime_ratings")
    .select("*")
    .eq("anime_id", animeId);

  if (error) {
    console.error(`Error fetching ratings for anime ${animeId}:`, error);
    return [];
  }

  return data || [];
};
