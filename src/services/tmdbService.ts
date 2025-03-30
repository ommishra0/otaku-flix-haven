
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// TMDB API configuration
const TMDB_API_KEY = "3e837fc7f5b5e791b9db45c25bc2c7e4"; // This is a public API key for TMDB
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const ANIME_GENRE_ID = 16; // Animation genre ID in TMDB

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
}

// Function to get trending anime from TMDB
export const getTrendingAnime = async (): Promise<TMDBAnime[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${ANIME_GENRE_ID}&sort_by=popularity.desc&page=1`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch trending anime");
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
      popularity: item.popularity
    }));
  } catch (error) {
    console.error("Error fetching trending anime:", error);
    toast({
      title: "Error",
      description: "Failed to fetch trending anime from TMDB",
      variant: "destructive"
    });
    return [];
  }
};

// Function to search anime by title
export const searchAnime = async (query: string): Promise<TMDBAnime[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&with_genres=${ANIME_GENRE_ID}&page=1`
    );
    
    if (!response.ok) {
      throw new Error("Failed to search anime");
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
      popularity: item.popularity
    }));
  } catch (error) {
    console.error("Error searching anime:", error);
    toast({
      title: "Error",
      description: "Failed to search anime on TMDB",
      variant: "destructive"
    });
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
      throw new Error("Failed to fetch anime details");
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
      popularity: item.popularity
    };
  } catch (error) {
    console.error("Error fetching anime details:", error);
    toast({
      title: "Error",
      description: "Failed to fetch anime details from TMDB",
      variant: "destructive"
    });
    return null;
  }
};

// Function to import anime from TMDB to Supabase database
export const importAnimeToDatabase = async (tmdbAnime: TMDBAnime): Promise<boolean> => {
  try {
    // Check if anime already exists in the database by title
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title')
      .eq('title', tmdbAnime.title)
      .limit(1);
    
    if (checkError) throw checkError;
    
    if (existingAnime && existingAnime.length > 0) {
      toast({
        title: "Anime already exists",
        description: `"${tmdbAnime.title}" is already in the database.`,
        variant: "warning"
      });
      return false;
    }
    
    // Insert anime into the database
    const { data, error } = await supabase
      .from('anime')
      .insert({
        title: tmdbAnime.title,
        description: tmdbAnime.overview,
        image_url: tmdbAnime.poster_path,
        banner_image_url: tmdbAnime.backdrop_path,
        rating: tmdbAnime.vote_average,
        release_year: new Date(tmdbAnime.release_date).getFullYear(),
        is_trending: tmdbAnime.popularity > 50,
        is_popular: tmdbAnime.vote_average > 7.5,
        type: "TV Series",
        status: "Completed"
      })
      .select('id, title')
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Success",
      description: `Added "${tmdbAnime.title}" to the database.`,
      variant: "success"
    });
    
    return true;
  } catch (error) {
    console.error("Error importing anime to database:", error);
    toast({
      title: "Import Failed",
      description: "Could not import anime to database",
      variant: "destructive"
    });
    return false;
  }
};
