
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define constants for TMDB API
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || ""; // Using Vite's environment variable approach

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
}

export interface TMDBAnimeDetail {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string | null;
  vote_average: number;
  number_of_seasons: number;
  seasons: TMDBSeason[];
  genres: { id: number; name: string }[];
  status: string;
}

export const searchTMDBAnime = async (query: string): Promise<TMDBAnimeDetail[]> => {
  try {
    if (!TMDB_API_KEY) {
      toast.error("TMDB API key is missing. Please configure the environment variable.");
      return [];
    }
    
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to search anime: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const filteredResults = data.results.filter((item: any) => 
      (item.genre_ids && item.genre_ids.includes(16)) || 
      item.name?.toLowerCase().includes('anime') ||
      item.original_name?.toLowerCase().includes('anime')
    );
    
    const detailedResults = await Promise.all(
      filteredResults.map((result: any) => getTMDBAnimeDetail(result.id))
    );
    
    return detailedResults.filter((item): item is TMDBAnimeDetail => item !== null);
  } catch (error) {
    console.error("Error searching TMDB anime:", error);
    toast.error("Failed to search anime on TMDB");
    return [];
  }
};

export const getTMDBAnimeDetail = async (tmdbId: number): Promise<TMDBAnimeDetail | null> => {
  try {
    if (!TMDB_API_KEY) {
      toast.error("TMDB API key is missing. Please configure the environment variable.");
      return null;
    }
    
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=seasons`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch anime details: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching TMDB anime details for ID ${tmdbId}:`, error);
    toast.error("Failed to fetch anime details from TMDB");
    return null;
  }
};

export const getTMDBSeasonDetail = async (tmdbId: number, seasonNumber: number): Promise<{ episodes: TMDBEpisode[] } | null> => {
  try {
    if (!TMDB_API_KEY) {
      toast.error("TMDB API key is missing. Please configure the environment variable.");
      return null;
    }
    
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch season details: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { episodes: data.episodes || [] };
  } catch (error) {
    console.error(`Error fetching TMDB season details for ID ${tmdbId}, season ${seasonNumber}:`, error);
    toast.error(`Failed to fetch season ${seasonNumber} details from TMDB`);
    return null;
  }
};

export const importAnimeToDatabase = async (anime: TMDBAnimeDetail): Promise<string | null> => {
  try {
    // Ensure we have an admin session before attempting to insert
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No authenticated session found");
      toast.error("Authentication required to import anime");
      return null;
    }

    console.log("Attempting to import anime:", anime.name);

    // Check if anime already exists by TMDB ID
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title, tmdb_id')
      .eq('tmdb_id', anime.id)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing anime:", checkError);
      toast.error(`Failed to check if anime exists: ${checkError.message}`);
      return null;
    }
    
    let animeId: string;
    
    if (existingAnime && existingAnime.length > 0) {
      console.log(`Anime "${anime.name}" already exists with ID: ${existingAnime[0].id}`);
      toast.info(`Anime "${anime.name}" already exists in the database.`);
      return existingAnime[0].id;
    } else {
      // Robust status normalization
      const statusMappings: { [key: string]: string } = {
        'Ended': 'Completed',
        'Returning Series': 'Ongoing',
        'In Production': 'Ongoing',
        'Pilot': 'Upcoming',
        'Canceled': 'Canceled'
      };

      let normalizedStatus = statusMappings[anime.status] || anime.status;
      
      // Fallback to 'Unknown' if status is not recognized
      if (!['Ongoing', 'Completed', 'Upcoming', 'Canceled', 'Unknown'].includes(normalizedStatus)) {
        normalizedStatus = 'Unknown';
      }
      
      // Prepare release year
      const releaseYear = anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : null;

      // Insert the anime with validated data
      const { data: newAnime, error: insertError } = await supabase
        .from('anime')
        .insert({
          title: anime.name,
          description: anime.overview,
          image_url: anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : null,
          banner_image_url: anime.backdrop_path ? `https://image.tmdb.org/t/p/original${anime.backdrop_path}` : null,
          release_year: releaseYear,
          rating: anime.vote_average,
          status: normalizedStatus,
          tmdb_id: anime.id,
          type: 'TV Series',
          is_custom: false
        })
        .select('id');
      
      if (insertError) {
        console.error("Error importing anime to database:", insertError);
        toast.error(`Failed to import anime: ${insertError.message}`);
        return null;
      }
      
      if (!newAnime || newAnime.length === 0) {
        console.error("Failed to insert anime - no ID returned");
        toast.error("Failed to insert anime to database");
        return null;
      }
      
      animeId = newAnime[0].id;
      console.log(`Successfully inserted anime "${anime.name}" with ID: ${animeId}`);
      toast.success(`Added anime "${anime.name}" to the database.`);
      return animeId;
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error importing anime to database:", error);
    toast.error(`Failed to import anime: ${errorMsg}`);
    return null;
  }
};

export const importSeasonToDatabase = async (animeId: string, season: TMDBSeason): Promise<string | null> => {
  try {
    // Verify user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No authenticated session found");
      toast.error("Authentication required to import seasons");
      return null;
    }

    const { data: existingSeason, error: checkError } = await supabase
      .from('seasons')
      .select('id')
      .eq('anime_id', animeId)
      .eq('season_number', season.season_number)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking if season exists:", checkError);
      toast.error(`Failed to check if season exists: ${checkError.message}`);
      return null;
    }
    
    if (existingSeason && existingSeason.length > 0) {
      console.log(`Season ${season.season_number} already exists with ID: ${existingSeason[0].id}`);
      toast.info(`Season ${season.season_number} already exists for this anime.`);
      return existingSeason[0].id;
    }
    
    const { data: newSeason, error: insertError } = await supabase
      .from('seasons')
      .insert({
        anime_id: animeId,
        season_number: season.season_number,
        name: season.name,
        overview: season.overview,
        air_date: season.air_date,
        poster_path: season.poster_path ? `https://image.tmdb.org/t/p/w500${season.poster_path}` : null,
        tmdb_id: season.id
      })
      .select('id');
    
    if (insertError) {
      console.error("Error inserting new season:", insertError);
      toast.error(`Failed to import season: ${insertError.message}`);
      return null;
    }
    
    if (!newSeason || newSeason.length === 0) {
      console.error("Failed to insert season - no ID returned");
      toast.error("Failed to insert season to database");
      return null;
    }
    
    console.log(`Successfully inserted season ${season.season_number} with ID: ${newSeason[0].id}`);
    toast.success(`Added season ${season.season_number}: "${season.name}"`);
    return newSeason[0].id;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error importing season to database:", error);
    toast.error(`Failed to import season ${season.season_number}: ${errorMsg}`);
    return null;
  }
};

export const importEpisodesToDatabase = async (
  animeId: string, 
  seasonId: string, 
  seasonNumber: number, 
  episodes: TMDBEpisode[]
): Promise<number> => {
  let successCount = 0;
  
  // Verify user is authenticated before batch operations
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    console.error("No authenticated session found for episode import");
    toast.error("Authentication required to import episodes");
    return 0;
  }
  
  for (const episode of episodes) {
    try {
      const { data: existingEpisode, error: checkError } = await supabase
        .from('episodes')
        .select('id')
        .eq('anime_id', animeId)
        .eq('season_id', seasonId)
        .eq('number', episode.episode_number)
        .eq('season_number', seasonNumber)
        .limit(1);
      
      if (checkError) {
        console.error(`Error checking if episode ${seasonNumber}x${episode.episode_number} exists:`, checkError);
        continue;
      }
      
      if (existingEpisode && existingEpisode.length > 0) {
        console.log(`Episode ${seasonNumber}x${episode.episode_number} already exists with ID: ${existingEpisode[0].id}`);
        successCount++; // Count as success since it's already there
        continue;
      }
      
      console.log(`Inserting episode ${seasonNumber}x${episode.episode_number} for anime ID: ${animeId}, season ID: ${seasonId}`);
      
      // Using the authenticated user's session from above
      const { error: insertError } = await supabase
        .from('episodes')
        .insert({
          anime_id: animeId,
          season_id: seasonId,
          season_number: seasonNumber,
          number: episode.episode_number,
          title: episode.name || `Episode ${episode.episode_number}`,
          description: episode.overview || '',
          thumbnail_url: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : null,
          air_date: episode.air_date,
          tmdb_id: episode.id,
          import_status: 'imported',
          video_url: null,
          embed_code: null
        });
      
      if (insertError) {
        console.error(`Error importing episode ${seasonNumber}x${episode.episode_number}:`, insertError);
        toast.error(`Failed to import episode ${seasonNumber}x${episode.episode_number}: ${insertError.message}`);
        continue;
      }
      
      console.log(`Successfully imported episode ${seasonNumber}x${episode.episode_number}`);
      successCount++;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`Error importing episode ${seasonNumber}x${episode.episode_number}:`, error);
      toast.error(`Failed to import episode ${seasonNumber}x${episode.episode_number}: ${errorMsg}`);
    }
  }
  
  if (successCount > 0) {
    toast.success(`Imported ${successCount} episodes for Season ${seasonNumber}`);
  }
  
  return successCount;
};

export const bulkImportAnimeWithSeasonsAndEpisodes = async (anime: TMDBAnimeDetail): Promise<boolean> => {
  try {
    // Verify authenticated session at the start
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No authenticated session found for bulk import");
      toast.error("Authentication required to perform bulk import");
      return false;
    }
    
    console.log("Starting bulk import for:", anime.name);
    
    const animeId = await importAnimeToDatabase(anime);
    if (!animeId) {
      console.error("Failed to import anime to database");
      return false;
    }
    
    let totalSeasons = 0;
    let totalEpisodes = 0;
    
    for (const season of anime.seasons) {
      if (season.season_number === 0) continue; // Skip specials
      
      console.log(`Processing season ${season.season_number}: ${season.name}`);
      const seasonId = await importSeasonToDatabase(animeId, season);
      if (!seasonId) {
        console.error(`Failed to import season ${season.season_number}`);
        continue;
      }
      
      totalSeasons++;
      
      const seasonDetail = await getTMDBSeasonDetail(anime.id, season.season_number);
      if (!seasonDetail) {
        console.error(`Failed to fetch details for season ${season.season_number}`);
        continue;
      }
      
      console.log(`Importing ${seasonDetail.episodes.length} episodes for season ${season.season_number}`);
      const episodesImported = await importEpisodesToDatabase(
        animeId, 
        seasonId, 
        season.season_number, 
        seasonDetail.episodes
      );
      
      totalEpisodes += episodesImported;
    }
    
    console.log(`Import complete: ${totalSeasons} seasons and ${totalEpisodes} episodes`);
    toast.success(`Successfully imported anime "${anime.name}" with ${totalSeasons} seasons and ${totalEpisodes} episodes!`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in bulk import:", error);
    toast.error(`Failed to complete bulk import: ${errorMsg}`);
    return false;
  }
};

export const importSpecificSeasonsForAnime = async (
  anime: TMDBAnimeDetail, 
  seasonNumbers: number[]
): Promise<boolean> => {
  try {
    // Verify authenticated session at the start
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.error("No authenticated session found for specific seasons import");
      toast.error("Authentication required to import selected seasons");
      return false;
    }
    
    console.log(`Starting import for specific seasons of ${anime.name}: ${seasonNumbers.join(', ')}`);
    
    const animeId = await importAnimeToDatabase(anime);
    if (!animeId) {
      console.error("Failed to import anime to database");
      return false;
    }
    
    let totalSeasons = 0;
    let totalEpisodes = 0;
    
    for (const seasonNumber of seasonNumbers) {
      const season = anime.seasons.find(s => s.season_number === seasonNumber);
      if (!season) {
        console.error(`Season ${seasonNumber} not found in anime data`);
        continue;
      }
      
      console.log(`Processing season ${seasonNumber}: ${season.name}`);
      const seasonId = await importSeasonToDatabase(animeId, season);
      if (!seasonId) {
        console.error(`Failed to import season ${seasonNumber}`);
        continue;
      }
      
      totalSeasons++;
      
      const seasonDetail = await getTMDBSeasonDetail(anime.id, seasonNumber);
      if (!seasonDetail) {
        console.error(`Failed to fetch details for season ${seasonNumber}`);
        continue;
      }
      
      console.log(`Importing ${seasonDetail.episodes.length} episodes for season ${seasonNumber}`);
      const episodesImported = await importEpisodesToDatabase(
        animeId, 
        seasonId, 
        seasonNumber, 
        seasonDetail.episodes
      );
      
      totalEpisodes += episodesImported;
    }
    
    console.log(`Import complete: ${totalSeasons} seasons and ${totalEpisodes} episodes`);
    toast.success(`Successfully imported ${totalSeasons} seasons and ${totalEpisodes} episodes for "${anime.name}"!`);
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Error in specific seasons import:", error);
    toast.error(`Failed to import selected seasons: ${errorMsg}`);
    return false;
  }
};
