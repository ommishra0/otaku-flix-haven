import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// TMDB API configuration
export const TMDB_API_KEY = 'd1aef4ce97f1eb865be6aabf156b6775';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const ANIME_GENRE_ID = 16; // Animation genre ID in TMDB

export interface TMDBAnime {
  id: number;
  title: string;
  original_title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  popularity: number;
  type?: string; // Added type property as optional
}

// Function to get trending anime from TMDB
export const getTrendingAnime = async (): Promise<TMDBAnime[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&sort_by=popularity.desc&page=1`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("TMDB API error:", errorData);
      throw new Error(`Failed to fetch trending anime: ${errorData.status_message || response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.results.map((item: any) => ({
      id: item.id,
      title: item.name || item.original_name,
      original_title: item.original_name,
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      overview: item.overview,
      release_date: item.first_air_date,
      vote_average: item.vote_average,
      popularity: item.popularity,
      // Determine if it's a movie or TV series based on the TMDB data
      type: item.media_type === 'movie' ? 'Movie' : 'TV Series'
    }));
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    toast.error("Failed to fetch trending anime from TMDB");
    return [];
  }
};

// Function to search anime by title
export const searchAnime = async (query: string): Promise<TMDBAnime[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("TMDB API error:", errorData);
      throw new Error(`Failed to search anime: ${errorData.status_message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Filter results to only include animation/anime
    return data.results
      .filter((item: any) => 
        // Keep only animation genre or anime-related keywords in title/overview
        (item.genre_ids && item.genre_ids.includes(ANIME_GENRE_ID)) || 
        item.name?.toLowerCase().includes('anime') ||
        item.original_name?.toLowerCase().includes('anime') ||
        item.overview?.toLowerCase().includes('anime')
      )
      .map((item: any) => ({
        id: item.id,
        title: item.name || item.original_name,
        original_title: item.original_name,
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        overview: item.overview,
        release_date: item.first_air_date,
        vote_average: item.vote_average,
        popularity: item.popularity,
        // Set type based on what we know
        type: 'TV Series' // Default to TV Series for search results
      }));
  } catch (error) {
    console.error("Error searching anime:", error);
    toast.error("Failed to search anime on TMDB");
    return [];
  }
};

// Function to get anime details by TMDB ID
export const getAnimeDetails = async (tmdbId: number): Promise<TMDBAnime | null> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("TMDB API error:", errorData);
      throw new Error(`Failed to fetch anime details: ${errorData.status_message || response.statusText}`);
    }
    
    const item = await response.json();
    
    return {
      id: item.id,
      title: item.name || item.original_name,
      original_title: item.original_name,
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
      overview: item.overview,
      release_date: item.first_air_date,
      vote_average: item.vote_average,
      popularity: item.popularity,
      type: 'TV Series' // Default to TV Series for TV details
    };
  } catch (error) {
    console.error("Error fetching anime details:", error);
    toast.error("Failed to fetch anime details from TMDB");
    return null;
  }
};

// Function to import anime from TMDB to Supabase database
export const importAnimeToDatabase = async (tmdbAnime: TMDBAnime, isTrending: boolean = false): Promise<boolean> => {
  try {
    console.log("Importing anime:", tmdbAnime.title, "with rating:", tmdbAnime.vote_average);
    
    // Check if anime already exists in the database by title
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title')
      .eq('title', tmdbAnime.title)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing anime:", checkError);
      throw checkError;
    }
    
    if (existingAnime && existingAnime.length > 0) {
      toast.error(`"${tmdbAnime.title}" is already in the database.`);
      return false;
    }
    
    // Ensure rating is within a valid range for the anime table
    let normalizedRating = tmdbAnime.vote_average;
    if (normalizedRating < 0) normalizedRating = 0;
    if (normalizedRating > 10) normalizedRating = 10;
    
    console.log("Normalized rating:", normalizedRating);
    
    // Prepare release year from date string
    const releaseYear = tmdbAnime.release_date ? new Date(tmdbAnime.release_date).getFullYear() : null;
    
    // Determine the type based on TMDB data
    const animeType = tmdbAnime.type || 'TV Series'; // Default to TV Series if type not specified
    
    // Insert anime into the database
    const { data, error } = await supabase
      .from('anime')
      .insert({
        title: tmdbAnime.title,
        description: tmdbAnime.overview,
        image_url: tmdbAnime.poster_path,
        banner_image_url: tmdbAnime.backdrop_path,
        rating: normalizedRating,
        release_year: releaseYear,
        is_trending: isTrending,
        is_popular: tmdbAnime.popularity > 50,
        is_custom: false,
        type: animeType,
        status: "Completed"
      })
      .select('id, title')
      .single();
    
    if (error) {
      console.error("Error importing anime to database:", error);
      throw error;
    }
    
    toast.success(`Added "${tmdbAnime.title}" to the database.`);
    console.log("Successfully imported anime:", tmdbAnime.title);
    
    return true;
  } catch (error) {
    console.error("Error importing anime to database:", error);
    toast.error("Could not import anime to database");
    return false;
  }
};

// Function to bulk import trending anime from TMDB
export const bulkImportTrendingAnime = async (): Promise<number> => {
  try {
    const trendingAnime = await getTrendingAnime();
    
    if (!trendingAnime.length) {
      toast.error("No trending anime found to import");
      return 0;
    }
    
    let importCount = 0;
    let failures = 0;
    
    for (const anime of trendingAnime) {
      console.log(`Attempting to import: ${anime.title}`);
      const success = await importAnimeToDatabase(anime, true);
      if (success) {
        importCount++;
      } else {
        failures++;
      }
    }
    
    if (importCount > 0) {
      toast.success(`Successfully imported ${importCount} trending anime!`);
    } else {
      toast.warning("No new trending anime were imported.");
    }
    
    if (failures > 0) {
      toast.warning(`${failures} anime could not be imported.`);
    }
    
    return importCount;
  } catch (error) {
    console.error("Error bulk importing trending anime:", error);
    toast.error("Failed to bulk import trending anime");
    return 0;
  }
};

// Function to add custom anime to the database
export const addCustomAnime = async (animeData: {
  title: string;
  description?: string;
  imageUrl?: string;
  bannerImageUrl?: string;
  releaseYear?: number;
  type?: string;
  status?: string;
}): Promise<string | null> => {
  try {
    // Check if anime already exists
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title')
      .eq('title', animeData.title)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing anime:", checkError);
      throw checkError;
    }
    
    if (existingAnime && existingAnime.length > 0) {
      toast.error(`"${animeData.title}" is already in the database.`);
      return null;
    }
    
    // Insert custom anime into the database
    const { data, error } = await supabase
      .from('anime')
      .insert({
        title: animeData.title,
        description: animeData.description || "",
        image_url: animeData.imageUrl || null,
        banner_image_url: animeData.bannerImageUrl || null,
        release_year: animeData.releaseYear || null,
        is_trending: false,
        is_popular: false,
        is_custom: true,
        type: animeData.type || "TV Series",
        status: animeData.status || "Ongoing"
      })
      .select('id, title')
      .single();
    
    if (error) {
      console.error("Error adding custom anime:", error);
      throw error;
    }
    
    toast.success(`Added custom anime "${animeData.title}" to the database.`);
    
    return data.id;
  } catch (error) {
    console.error("Error adding custom anime:", error);
    toast.error("Could not add custom anime to database");
    return null;
  }
};

// Function to add an episode with embed code
export const addEpisodeWithEmbed = async (
  animeId: string,
  episodeData: {
    title: string;
    number: number;
    description?: string;
    thumbnailUrl?: string;
    embedProvider?: string; // e.g., 'filemoon', 'streamtab'
    embedCode?: string; // The embed HTML or iframe code
  }
): Promise<string | null> => {
  try {
    // Insert episode with embed code
    const { data, error } = await supabase
      .from('episodes')
      .insert({
        anime_id: animeId,
        title: episodeData.title,
        number: episodeData.number,
        description: episodeData.description || "",
        thumbnail_url: episodeData.thumbnailUrl || null,
        embed_provider: episodeData.embedProvider || null,
        embed_code: episodeData.embedCode || null
      })
      .select('id, title')
      .single();
    
    if (error) {
      console.error("Error adding episode with embed:", error);
      throw error;
    }
    
    toast.success(`Added episode ${episodeData.number}: "${episodeData.title}"`);
    
    return data.id;
  } catch (error) {
    console.error("Error adding episode with embed:", error);
    toast.error("Could not add episode to database");
    return null;
  }
};

// Fetch anime by TMDB ID
export const fetchAnimeByTMDB = async (tmdbId: number) => {
  try {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('tmdb_id', tmdbId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching anime by TMDB ID:", error);
    return null;
  }
};

// Fetch popular anime from TMDB
export const fetchTrendingFromTMDB = async (page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending anime');
    }
    
    const data = await response.json();
    
    // Filter for animation genre
    const animeResults = data.results.filter((show: any) => 
      show.genre_ids && show.genre_ids.includes(ANIME_GENRE_ID)
    );
    
    return animeResults;
  } catch (error) {
    console.error('Error fetching trending anime from TMDB:', error);
    toast({
      title: "Error",
      description: "Failed to load trending anime",
      variant: "destructive"
    });
    return [];
  }
};
