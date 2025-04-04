
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define Anime type here instead of importing from animeService to avoid circular dependency
export interface AnimeFromDB {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  banner_image_url?: string;
  rating?: number;
  release_year?: number;
  is_trending?: boolean;
  is_popular?: boolean;
  is_custom?: boolean;
  type?: string;
  status?: string;
  anilist_id?: number;
  created_at?: string;
  updated_at?: string;
}

// AniList API configuration
export const ANILIST_API_URL = 'https://graphql.anilist.co';

export interface AniListAnime {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    medium: string;
  };
  bannerImage: string;
  format: string; // TV, MOVIE, OVA, etc.
  episodes: number;
  duration: number;
  status: string;
  season: string;
  seasonYear: number;
  averageScore: number;
  popularity: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  genres: string[];
}

// Simplified media type with explicit UI-related properties
export interface AniListMedia {
  id: number;
  title: {
    english?: string;
    romaji?: string;
    native?: string;
  };
  coverImage: {
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  description?: string;
  format?: string;
  startDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  episodes?: number;
  averageScore?: number;
  popularity?: number;
  // Explicitly add UI-specific properties
  poster_path?: string;
  vote_average?: number;
  release_date?: string;
}

// Mapping AniList status to our database status
const mapAniListStatus = (status: string): string => {
  switch (status) {
    case 'FINISHED':
      return 'Completed';
    case 'RELEASING':
      return 'Ongoing';
    case 'NOT_YET_RELEASED':
      return 'Upcoming';
    case 'CANCELLED':
      return 'Canceled';
    default:
      return 'Unknown';
  }
};

// Function to search anime on AniList
export const searchAniListAnime = async (query: string): Promise<AniListMedia[]> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Page(page: 1, perPage: 10) {
              media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                format
                episodes
                startDate {
                  year
                  month
                  day
                }
                averageScore
                popularity
              }
            }
          }
        `,
        variables: {
          search: query
        }
      }),
    });

    const { data } = await response.json();
    
    if (!data || !data.Page || !data.Page.media) {
      console.error("Invalid response format from AniList API");
      return [];
    }

    // Transform AniList data with proper type safety
    return data.Page.media.map((item: any): AniListMedia => {
      const voteAverage = item.averageScore ? (item.averageScore / 10) : 0;
      
      const releaseDate = item.startDate && item.startDate.year 
        ? `${item.startDate.year}-${item.startDate.month || 1}-${item.startDate.day || 1}` 
        : '';

      return {
        id: item.id,
        title: {
          english: item.title.english || '',
          romaji: item.title.romaji || '',
          native: item.title.native || '',
        },
        coverImage: {
          large: item.coverImage?.large || '',
          medium: item.coverImage?.medium || '',
        },
        poster_path: item.coverImage?.large || '',
        bannerImage: item.bannerImage || '',
        description: item.description || '',
        format: item.format || '',
        startDate: {
          year: item.startDate?.year,
          month: item.startDate?.month,
          day: item.startDate?.day,
        },
        episodes: item.episodes || 0,
        averageScore: item.averageScore || 0,
        popularity: item.popularity || 0,
        vote_average: voteAverage,
        release_date: releaseDate
      };
    });
  } catch (error) {
    console.error("Error searching anime on AniList:", error);
    toast.error("Failed to search anime on AniList");
    return [];
  }
};

// Function to get anime details by AniList ID
export const getAniListAnimeDetails = async (anilistId: number): Promise<AniListAnime | null> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                medium
              }
              bannerImage
              format
              episodes
              duration
              status
              season
              seasonYear
              averageScore
              popularity
              startDate {
                year
                month
                day
              }
              genres
            }
          }
        `,
        variables: {
          id: anilistId
        }
      }),
    });

    const { data } = await response.json();
    
    if (!data || !data.Media) {
      console.error("Invalid response format from AniList API");
      return null;
    }

    return data.Media;
  } catch (error) {
    console.error("Error fetching anime details from AniList:", error);
    toast.error("Failed to fetch anime details from AniList");
    return null;
  }
};

// Function to import anime from AniList to Supabase database
export const importAniListAnimeToDatabase = async (anilistAnime: AniListAnime): Promise<string | null> => {
  try {
    console.log("Importing anime from AniList:", anilistAnime.title.english || anilistAnime.title.romaji);
    
    // Check if anime already exists in the database
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id, title')
      .eq('anilist_id', anilistAnime.id)
      .limit(1);
    
    if (checkError) {
      console.error("Error checking existing anime:", checkError);
      throw checkError;
    }
    
    if (existingAnime && existingAnime.length > 0) {
      console.log(`"${existingAnime[0].title}" is already in the database.`);
      return existingAnime[0].id;
    }
    
    // Ensure rating is within a valid range
    let normalizedRating = anilistAnime.averageScore ? anilistAnime.averageScore / 10 : 0; // Convert to 0-10 scale
    if (normalizedRating < 0) normalizedRating = 0;
    if (normalizedRating > 10) normalizedRating = 10;
    
    // Map AniList status to our database status
    const animeStatus = mapAniListStatus(anilistAnime.status);
    
    // Determine anime type based on format
    const animeType = anilistAnime.format === 'MOVIE' ? 'Movie' : 'TV Series';
    
    // Handle potentially missing data
    const title = anilistAnime.title.english || anilistAnime.title.romaji || 'Unknown Anime';
    const description = anilistAnime.description || '';
    const imageUrl = anilistAnime.coverImage?.large || '';
    const bannerImageUrl = anilistAnime.bannerImage || '';
    const releaseYear = anilistAnime.startDate?.year || null;
    
    // Insert anime into the database
    const { data, error } = await supabase
      .from('anime')
      .insert({
        title: title,
        description: description,
        image_url: imageUrl,
        banner_image_url: bannerImageUrl,
        rating: normalizedRating,
        release_year: releaseYear,
        is_trending: false,
        is_popular: anilistAnime.popularity > 5000, // Arbitrary threshold
        is_custom: false,
        type: animeType,
        status: animeStatus,
        anilist_id: anilistAnime.id // Store AniList ID for future reference
      })
      .select('id, title')
      .single();
    
    if (error) {
      console.error("Error importing anime to database:", error);
      throw error;
    }
    
    toast.success(`Added "${title}" to the database.`);
    console.log("Successfully imported anime:", title);
    
    return data.id;
  } catch (error: any) {
    console.error("Error importing anime to database:", error);
    toast.error(`Import failed: ${error.message || 'Unknown error'}`);
    return null;
  }
};

// Similar changes for getTrendingAniListAnime function
export const getTrendingAniListAnime = async (): Promise<AniListMedia[]> => {
  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            Page(page: 1, perPage: 20) {
              media(type: ANIME, sort: TRENDING_DESC) {
                id
                title {
                  romaji
                  english
                  native
                }
                description
                coverImage {
                  large
                  medium
                }
                bannerImage
                format
                episodes
                startDate {
                  year
                  month
                  day
                }
                averageScore
                popularity
              }
            }
          }
        `
      }),
    });

    const { data } = await response.json();
    
    if (!data || !data.Page || !data.Page.media) {
      console.error("Invalid response format from AniList API");
      return [];
    }

    // Transform AniList data with proper type safety
    return data.Page.media.map((item: any): AniListMedia => {
      const voteAverage = item.averageScore ? (item.averageScore / 10) : 0;
      
      const releaseDate = item.startDate && item.startDate.year 
        ? `${item.startDate.year}-${item.startDate.month || 1}-${item.startDate.day || 1}` 
        : '';

      return {
        id: item.id,
        title: {
          english: item.title.english || '',
          romaji: item.title.romaji || '',
          native: item.title.native || '',
        },
        coverImage: {
          large: item.coverImage?.large || '',
          medium: item.coverImage?.medium || '',
        },
        poster_path: item.coverImage?.large || '',
        bannerImage: item.bannerImage || '',
        description: item.description || '',
        format: item.format || '',
        startDate: {
          year: item.startDate?.year,
          month: item.startDate?.month,
          day: item.startDate?.day,
        },
        episodes: item.episodes || 0,
        averageScore: item.averageScore || 0,
        popularity: item.popularity || 0,
        vote_average: voteAverage,
        release_date: releaseDate
      };
    });
  } catch (error) {
    console.error("Error fetching trending anime from AniList:", error);
    toast.error("Failed to fetch trending anime from AniList");
    return [];
  }
};

// Function to bulk import trending anime from AniList
export const bulkImportTrendingAniListAnime = async (): Promise<number> => {
  try {
    const trendingAnime = await getTrendingAniListAnime();
    
    if (!trendingAnime.length) {
      toast.error("No trending anime found to import");
      return 0;
    }
    
    let importCount = 0;
    let failures = 0;
    
    // Start with a toast notification to show progress
    const loadingToast = toast.loading(`Importing ${trendingAnime.length} anime from AniList...`);
    
    for (const animeMedia of trendingAnime) {
      try {
        const animeDetails = await getAniListAnimeDetails(animeMedia.id);
      
        if (!animeDetails) {
          console.error(`Could not fetch details for anime ID: ${animeMedia.id}`);
          failures++;
          continue;
        }
        
        const animeId = await importAniListAnimeToDatabase(animeDetails);
        
        if (animeId) {
          importCount++;
        } else {
          failures++;
        }
      } catch (err) {
        console.error(`Error importing anime ID ${animeMedia.id}:`, err);
        failures++;
      }
    }
    
    // Dismiss the loading toast
    toast.dismiss(loadingToast);
    
    if (importCount > 0) {
      toast.success(`Successfully imported ${importCount} trending anime from AniList!`);
    } else {
      toast.warning("No new trending anime were imported from AniList.");
    }
    
    if (failures > 0) {
      toast.warning(`${failures} anime could not be imported from AniList.`);
    }
    
    return importCount;
  } catch (error) {
    console.error("Error bulk importing trending anime from AniList:", error);
    toast.error("Failed to bulk import trending anime from AniList");
    return 0;
  }
};

// Function to fetch anime by AniList ID from database
export const fetchAnimeByAniListId = async (anilistId: number): Promise<AnimeFromDB | null> => {
  try {
    const { data, error } = await supabase
      .from('anime')
      .select('*')
      .eq('anilist_id', anilistId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching anime by AniList ID:", error);
    return null;
  }
};
