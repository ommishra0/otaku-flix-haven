
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AniListTitle {
  romaji: string;
  english: string;
  native: string;
}

export interface AniListImage {
  large: string;
  medium: string;
}

export interface AniListDate {
  year: number;
  month: number;
  day: number;
}

export interface AniListTag {
  name: string;
  rank: number;
}

export interface AniListStudio {
  node: {
    name: string;
    isAnimationStudio: boolean;
  };
}

export interface AniListCharacter {
  node: {
    name: {
      full: string;
    };
    image: {
      large: string;
    };
  };
  role: string;
  voiceActors: {
    name: {
      full: string;
    };
    image: {
      large: string;
    };
  }[];
}

export interface AniListAnime {
  id: number;
  title: AniListTitle;
  description: string;
  format: string;
  episodes: number;
  duration: number;
  status: string;
  startDate: AniListDate;
  endDate: AniListDate;
  season: string;
  seasonYear: number;
  averageScore: number;
  popularity: number;
  genres: string[];
  tags: AniListTag[];
  coverImage: AniListImage;
  bannerImage: string;
  studios: {
    edges: AniListStudio[];
  };
  characters: {
    edges: AniListCharacter[];
  };
}

// Update the AniListMedia interface to include all required properties
export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string;
    native: string;
  };
  startDate: {
    year: number;
  };
  episodes: number;
  averageScore: number;
  format: string;
  description: string;
  bannerImage: string;
  coverImage: {
    large: string;
    medium: string;
  };
  vote_average: number;
  poster_path: string;
}

export const searchAniListAnime = async (query: string): Promise<AniListMedia[]> => {
  try {
    const graphqlQuery = {
      query: `
        query ($search: String) {
          Page(page: 1, perPage: 10) {
            media(search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              startDate {
                year
              }
              episodes
              averageScore
              format
              description
              coverImage {
                large
                medium
              }
              bannerImage
            }
          }
        }
      `,
      variables: {
        search: query,
      },
    };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('AniList API Error:', data.errors);
      return [];
    }

    const media = data.data.Page.media.map((item: any) => ({
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      episodes: item.episodes,
      averageScore: item.averageScore,
      format: item.format,
      description: item.description,
      coverImage: item.coverImage,
      bannerImage: item.bannerImage,
      vote_average: item.averageScore,
      poster_path: item.coverImage?.large,
    }));

    return media;
  } catch (error) {
    console.error('Error fetching anime from AniList:', error);
    return [];
  }
};

export const getTrendingAniListAnime = async (): Promise<AniListMedia[]> => {
  try {
    const graphqlQuery = {
      query: `
        query {
          Page(page: 1, perPage: 50) {
            media(sort: TRENDING_DESC, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              startDate {
                year
              }
              episodes
              averageScore
              format
              description
              coverImage {
                large
                medium
              }
              bannerImage
            }
          }
        }
      `,
    };

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    });

    const data = await response.json();

    if (data.errors) {
      console.error('AniList API Error:', data.errors);
      return [];
    }

    const media = data.data.Page.media.map((item: any) => ({
      id: item.id,
      title: item.title,
      startDate: item.startDate,
      episodes: item.episodes,
      averageScore: item.averageScore,
      format: item.format,
      description: item.description,
      coverImage: item.coverImage,
      bannerImage: item.bannerImage,
      vote_average: item.averageScore,
      poster_path: item.coverImage?.large,
    }));

    return media;
  } catch (error) {
    console.error('Error fetching trending anime from AniList:', error);
    return [];
  }
};

// Fix the function with the excessive type instantiation error by explicitly typing the return value
export const getAniListAnimeDetails = async (id: number): Promise<AniListAnime | null> => {
  try {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
          description
          format
          episodes
          duration
          status
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          averageScore
          popularity
          genres
          tags {
            name
            rank
          }
          coverImage {
            large
            medium
          }
          bannerImage
          studios {
            edges {
              node {
                name
                isAnimationStudio
              }
            }
          }
          characters(sort: ROLE) {
            edges {
              node {
                name {
                  full
                }
                image {
                  large
                }
              }
              role
              voiceActors(language: JAPANESE) {
                name {
                  full
                }
                image {
                  large
                }
              }
            }
          }
        }
      }
    `;

    const variables = { id };
    const response = await fetch("https://graphql.anilist.co", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const data = await response.json();
    
    // Check if we got valid data
    if (data.errors || !data.data || !data.data.Media) {
      console.error('AniList API Error:', data.errors || 'No data returned');
      return null;
    }

    // Extract the media data
    const media = data.data.Media;

    // Create a properly typed object to avoid excessive type instantiation
    const animeDetails: AniListAnime = {
      id: media.id,
      title: {
        romaji: media.title.romaji || '',
        english: media.title.english || '',
        native: media.title.native || ''
      },
      description: media.description || '',
      format: media.format || '',
      episodes: media.episodes || 0,
      duration: media.duration || 0,
      status: media.status || '',
      startDate: {
        year: media.startDate?.year || 0,
        month: media.startDate?.month || 0,
        day: media.startDate?.day || 0
      },
      endDate: {
        year: media.endDate?.year || 0,
        month: media.endDate?.month || 0,
        day: media.endDate?.day || 0
      },
      season: media.season || '',
      seasonYear: media.seasonYear || 0,
      averageScore: media.averageScore || 0,
      popularity: media.popularity || 0,
      genres: media.genres || [],
      tags: media.tags?.map((tag: any) => ({
        name: tag.name || '',
        rank: tag.rank || 0
      })) || [],
      coverImage: {
        large: media.coverImage?.large || '',
        medium: media.coverImage?.medium || ''
      },
      bannerImage: media.bannerImage || '',
      studios: {
        edges: media.studios?.edges?.map((edge: any) => ({
          node: {
            name: edge.node?.name || '',
            isAnimationStudio: edge.node?.isAnimationStudio || false
          }
        })) || []
      },
      characters: {
        edges: media.characters?.edges?.map((edge: any) => ({
          node: {
            name: {
              full: edge.node?.name?.full || ''
            },
            image: {
              large: edge.node?.image?.large || ''
            }
          },
          role: edge.role || '',
          voiceActors: edge.voiceActors?.map((actor: any) => ({
            name: {
              full: actor.name?.full || ''
            },
            image: {
              large: actor.image?.large || ''
            }
          })) || []
        })) || []
      }
    };

    return animeDetails;
  } catch (error) {
    console.error('Error fetching anime details from AniList:', error);
    return null;
  }
};

// Make sure the importAniListAnimeToDatabase function properly uses the anilist_id field
export const importAniListAnimeToDatabase = async (anime: AniListAnime): Promise<boolean> => {
  try {
    // Check if anime already exists by anilist_id
    const { data: existingAnime, error: checkError } = await supabase
      .from('anime')
      .select('id')
      .eq('anilist_id', anime.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking for existing anime:', checkError);
      return false;
    }

    // If anime already exists, update it
    if (existingAnime) {
      const { error: updateError } = await supabase
        .from('anime')
        .update({
          title: anime.title.english || anime.title.romaji,
          description: anime.description ? anime.description.replace(/<[^>]*>/g, '') : null,
          image_url: anime.coverImage.large || anime.coverImage.medium,
          banner_image_url: anime.bannerImage,
          rating: anime.averageScore ? anime.averageScore / 20 : null, // Convert from 100-scale to 5-scale
          release_year: anime.startDate.year,
          status: anime.status,
          studio: anime.studios.edges.length > 0 ? anime.studios.edges[0].node.name : null,
          type: anime.format,
          is_trending: true, // Assume import from AniList is trending
          updated_at: new Date().toISOString(),
          anilist_id: anime.id
        })
        .eq('id', existingAnime.id);

      if (updateError) {
        console.error('Error updating anime in database:', updateError);
        return false;
      }
      
      return true;
    }

    // Insert new anime
    const { data: insertedAnime, error: insertError } = await supabase
      .from('anime')
      .insert({
        title: anime.title.english || anime.title.romaji,
        description: anime.description ? anime.description.replace(/<[^>]*>/g, '') : null,
        image_url: anime.coverImage.large || anime.coverImage.medium,
        banner_image_url: anime.bannerImage,
        rating: anime.averageScore ? anime.averageScore / 20 : null, // Convert from 100-scale to 5-scale
        release_year: anime.startDate.year,
        status: anime.status,
        studio: anime.studios.edges.length > 0 ? anime.studios.edges[0].node.name : null,
        type: anime.format,
        is_trending: true, // Assume import from AniList is trending
        is_popular: false,
        is_featured: false,
        anilist_id: anime.id
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error inserting anime to database:', insertError);
      return false;
    }

    console.log('Successfully imported anime from AniList:', anime.title.english || anime.title.romaji);
    return true;
  } catch (error) {
    console.error('Error in importAniListAnimeToDatabase:', error);
    return false;
  }
};

// Update the bulk import function to properly use anilist_id
export const bulkImportTrendingAniListAnime = async (): Promise<number> => {
  try {
    const trendingAnime = await getTrendingAniListAnime();
    let importCount = 0;
    
    for (const anime of trendingAnime) {
      try {
        const animeDetail = await getAniListAnimeDetails(anime.id);
        if (animeDetail) {
          const success = await importAniListAnimeToDatabase(animeDetail);
          if (success) {
            importCount++;
          }
        }
      } catch (error) {
        console.error(`Error importing anime ${anime.id}:`, error);
      }
    }
    
    if (importCount > 0) {
      toast.success(`Successfully imported ${importCount} trending anime from AniList!`);
    } else {
      toast.error('Failed to import any trending anime from AniList.');
    }
    
    return importCount;
  } catch (error) {
    console.error('Error in bulkImportTrendingAniListAnime:', error);
    toast.error('Failed to import trending anime from AniList.');
    return 0;
  }
};
