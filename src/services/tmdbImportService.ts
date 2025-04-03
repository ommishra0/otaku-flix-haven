import { supabase } from "@/integrations/supabase/client";
import { TMDB_API_KEY, TMDB_BASE_URL } from "@/services/tmdbService";
import { toast } from "sonner";

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
      toast.error("TMDB API key is missing. Please configure the VITE_TMDB_API_KEY environment variable.");
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
      toast.error("TMDB API key is missing. Please configure the VITE_TMDB_API_KEY environment variable.");
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
      toast.error("TMDB API key is missing. Please configure the VITE_TMDB_API_KEY environment variable.");
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
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title, tmdb_id')
      .eq('tmdb_id', anime.id)
      .limit(1);
    
    if (checkError) throw checkError;
    
    let animeId: string;
    
    if (existingAnime && existingAnime.length > 0) {
      toast.info(`Anime "${anime.name}" already exists in the database.`);
      return existingAnime[0].id;
    } else {
      const { data: newAnime, error: insertError } = await supabase
        .from('anime')
        .insert({
          title: anime.name,
          description: anime.overview,
          image_url: anime.poster_path ? `https://image.tmdb.org/t/p/w500${anime.poster_path}` : null,
          banner_image_url: anime.backdrop_path ? `https://image.tmdb.org/t/p/original${anime.backdrop_path}` : null,
          release_year: anime.first_air_date ? new Date(anime.first_air_date).getFullYear() : null,
          rating: anime.vote_average,
          status: anime.status,
          tmdb_id: anime.id,
          type: 'TV Series',
          is_custom: false
        })
        .select('id');
      
      if (insertError) throw insertError;
      if (!newAnime || newAnime.length === 0) throw new Error("Failed to insert anime");
      
      animeId = newAnime[0].id;
      toast.success(`Added anime "${anime.name}" to the database.`);
      return animeId;
    }
  } catch (error) {
    console.error("Error importing anime to database:", error);
    toast.error("Failed to import anime to database");
    return null;
  }
};

export const importSeasonToDatabase = async (animeId: string, season: TMDBSeason): Promise<string | null> => {
  try {
    const { data: existingSeason, error: checkError } = await supabase
      .from('seasons')
      .select('id')
      .eq('anime_id', animeId)
      .eq('season_number', season.season_number)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking if season exists:", checkError);
      throw checkError;
    }
    
    if (existingSeason && existingSeason.length > 0) {
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
      throw insertError;
    }
    
    if (!newSeason || newSeason.length === 0) {
      throw new Error("Failed to insert season");
    }
    
    toast.success(`Added season ${season.season_number}: "${season.name}"`);
    return newSeason[0].id;
  } catch (error) {
    console.error("Error importing season to database:", error);
    toast.error(`Failed to import season ${season.season_number}`);
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
      
      if (checkError) throw checkError;
      
      if (existingEpisode && existingEpisode.length > 0) {
        console.log(`Episode ${seasonNumber}x${episode.episode_number} already exists.`);
        continue;
      }
      
      const { error: insertError } = await supabase
        .from('episodes')
        .insert({
          anime_id: animeId,
          season_id: seasonId,
          season_number: seasonNumber,
          number: episode.episode_number,
          title: episode.name,
          description: episode.overview,
          thumbnail_url: episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : null,
          air_date: episode.air_date,
          tmdb_id: episode.id,
          import_status: 'imported',
          video_url: null,
          embed_code: null
        });
      
      if (insertError) throw insertError;
      
      successCount++;
    } catch (error) {
      console.error(`Error importing episode ${seasonNumber}x${episode.episode_number}:`, error);
    }
  }
  
  if (successCount > 0) {
    toast.success(`Imported ${successCount} episodes for Season ${seasonNumber}`);
  }
  
  return successCount;
};

export const bulkImportAnimeWithSeasonsAndEpisodes = async (anime: TMDBAnimeDetail): Promise<boolean> => {
  try {
    const animeId = await importAnimeToDatabase(anime);
    if (!animeId) return false;
    
    let totalSeasons = 0;
    let totalEpisodes = 0;
    
    for (const season of anime.seasons) {
      if (season.season_number === 0) continue;
      
      const seasonId = await importSeasonToDatabase(animeId, season);
      if (!seasonId) continue;
      
      totalSeasons++;
      
      const seasonDetail = await getTMDBSeasonDetail(anime.id, season.season_number);
      if (!seasonDetail) continue;
      
      const episodesImported = await importEpisodesToDatabase(
        animeId, 
        seasonId, 
        season.season_number, 
        seasonDetail.episodes
      );
      
      totalEpisodes += episodesImported;
    }
    
    toast.success(`Successfully imported anime "${anime.name}" with ${totalSeasons} seasons and ${totalEpisodes} episodes!`);
    return true;
  } catch (error) {
    console.error("Error in bulk import:", error);
    toast.error("Failed to complete bulk import");
    return false;
  }
};

export const importSpecificSeasonsForAnime = async (
  anime: TMDBAnimeDetail, 
  seasonNumbers: number[]
): Promise<boolean> => {
  try {
    const animeId = await importAnimeToDatabase(anime);
    if (!animeId) return false;
    
    let totalSeasons = 0;
    let totalEpisodes = 0;
    
    for (const seasonNumber of seasonNumbers) {
      const season = anime.seasons.find(s => s.season_number === seasonNumber);
      if (!season) continue;
      
      const seasonId = await importSeasonToDatabase(animeId, season);
      if (!seasonId) continue;
      
      totalSeasons++;
      
      const seasonDetail = await getTMDBSeasonDetail(anime.id, seasonNumber);
      if (!seasonDetail) continue;
      
      const episodesImported = await importEpisodesToDatabase(
        animeId, 
        seasonId, 
        seasonNumber, 
        seasonDetail.episodes
      );
      
      totalEpisodes += episodesImported;
    }
    
    toast.success(`Successfully imported ${totalSeasons} seasons and ${totalEpisodes} episodes for "${anime.name}"!`);
    return true;
  } catch (error) {
    console.error("Error in specific seasons import:", error);
    toast.error("Failed to import selected seasons");
    return false;
  }
};
