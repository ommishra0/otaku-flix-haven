
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Function to get personalized anime recommendations based on user preferences
export const getPersonalizedRecommendations = async (userId: string): Promise<any[]> => {
  try {
    // Get user's watch history
    const { data: watchHistory, error: watchHistoryError } = await supabase
      .from('watch_history')
      .select(`
        episode_id,
        episodes:episode_id (
          anime_id
        )
      `)
      .eq('user_id', userId)
      .limit(20);
    
    if (watchHistoryError) throw watchHistoryError;
    
    // Extract unique anime IDs from watch history
    const watchedAnimeIds = [...new Set(
      watchHistory
        .filter(item => item.episodes?.anime_id)
        .map(item => item.episodes.anime_id)
    )];
    
    if (watchedAnimeIds.length === 0) {
      // If no watch history, return trending anime
      const { data: trendingAnime, error: trendingError } = await supabase
        .from('anime')
        .select('*')
        .eq('is_trending', true)
        .limit(10);
      
      if (trendingError) throw trendingError;
      return trendingAnime || [];
    }
    
    // Get category IDs from watched anime
    const { data: animeCategories, error: categoriesError } = await supabase
      .from('anime_categories')
      .select('category_id')
      .in('anime_id', watchedAnimeIds);
    
    if (categoriesError) throw categoriesError;
    
    // Count category occurrences to find user preferences
    const categoryCounts: Record<string, number> = {};
    animeCategories.forEach(item => {
      categoryCounts[item.category_id] = (categoryCounts[item.category_id] || 0) + 1;
    });
    
    // Sort categories by count and take top 3
    const preferredCategories = Object.entries(categoryCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([categoryId]) => categoryId);
    
    if (preferredCategories.length === 0) {
      // If no categories found, return popular anime
      const { data: popularAnime, error: popularError } = await supabase
        .from('anime')
        .select('*')
        .eq('is_popular', true)
        .limit(10);
      
      if (popularError) throw popularError;
      return popularAnime || [];
    }
    
    // Get recommendations based on preferred categories, excluding already watched anime
    const { data: recommendations, error: recommendationsError } = await supabase
      .from('anime_categories')
      .select(`
        anime_id,
        anime:anime_id (*)
      `)
      .in('category_id', preferredCategories)
      .not('anime_id', 'in', watchedAnimeIds.length > 0 ? watchedAnimeIds : [''])
      .limit(30);
    
    if (recommendationsError) throw recommendationsError;
    
    // Extract unique anime records
    const uniqueAnime = Array.from(
      new Map(
        recommendations
          .filter(item => item.anime)
          .map(item => [item.anime.id, item.anime])
      ).values()
    );
    
    // Sort by rating (descending) and take top 10
    return uniqueAnime
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10);
    
  } catch (error) {
    console.error("Error getting personalized recommendations:", error);
    toast.error("Failed to generate recommendations");
    return [];
  }
};

// Function to get similar anime based on an anime ID
export const getSimilarAnime = async (animeId: string): Promise<any[]> => {
  try {
    // Get categories of the given anime
    const { data: animeCategories, error: categoriesError } = await supabase
      .from('anime_categories')
      .select('category_id')
      .eq('anime_id', animeId);
    
    if (categoriesError) throw categoriesError;
    
    if (!animeCategories || animeCategories.length === 0) {
      // If no categories found, return trending anime
      const { data: trendingAnime, error: trendingError } = await supabase
        .from('anime')
        .select('*')
        .eq('is_trending', true)
        .neq('id', animeId) // Exclude current anime
        .limit(6);
      
      if (trendingError) throw trendingError;
      return trendingAnime || [];
    }
    
    // Get category IDs
    const categoryIds = animeCategories.map(item => item.category_id);
    
    // Get anime with similar categories, excluding the current anime
    const { data: similarAnime, error: similarError } = await supabase
      .from('anime_categories')
      .select(`
        anime_id,
        anime:anime_id (*)
      `)
      .in('category_id', categoryIds)
      .neq('anime_id', animeId)
      .limit(20);
    
    if (similarError) throw similarError;
    
    // Count occurrences of each anime to rank by category overlap
    const animeCounts: Record<string, { count: number; anime: any }> = {};
    
    similarAnime.forEach(item => {
      if (!item.anime) return;
      
      if (!animeCounts[item.anime.id]) {
        animeCounts[item.anime.id] = { count: 0, anime: item.anime };
      }
      
      animeCounts[item.anime.id].count += 1;
    });
    
    // Sort by category overlap count (descending) and then by rating (descending)
    const sortedAnime = Object.values(animeCounts)
      .sort((a, b) => {
        // First sort by category overlap count
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then by rating
        return (b.anime.rating || 0) - (a.anime.rating || 0);
      })
      .map(item => item.anime)
      .slice(0, 6);
    
    return sortedAnime;
    
  } catch (error) {
    console.error("Error getting similar anime:", error);
    toast.error("Failed to find similar anime");
    return [];
  }
};

// Function to get anime recommendations based on a specific mood or theme
export const getAnimeByMood = async (mood: string): Promise<any[]> => {
  try {
    let query = supabase
      .from('anime')
      .select('*');
    
    // Apply filters based on mood
    switch (mood.toLowerCase()) {
      case 'action':
      case 'adventure':
      case 'romance':
      case 'comedy':
      case 'drama':
      case 'fantasy':
      case 'sci-fi':
      case 'horror':
      case 'mystery':
      case 'thriller':
        // For category-based moods, we need to find categories with similar names
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id')
          .ilike('name', `%${mood}%`)
          .single();
        
        if (categoryError || !categoryData) {
          // If category not found, return popular anime
          const { data: popularAnime, error: popularError } = await supabase
            .from('anime')
            .select('*')
            .eq('is_popular', true)
            .limit(10);
          
          if (popularError) throw popularError;
          return popularAnime || [];
        }
        
        // Get anime with this category
        const { data: animeWithCategory, error: animeCategoryError } = await supabase
          .from('anime_categories')
          .select(`
            anime:anime_id (*)
          `)
          .eq('category_id', categoryData.id)
          .limit(10);
        
        if (animeCategoryError) throw animeCategoryError;
        
        return animeWithCategory.map(item => item.anime) || [];
        
      case 'happy':
      case 'uplifting':
        // Happy or uplifting mood might include comedy and slice of life
        query = query.or('description.ilike.%comedy%,description.ilike.%slice of life%');
        break;
        
      case 'sad':
      case 'emotional':
        // Sad or emotional mood might include drama and tragedy
        query = query.or('description.ilike.%drama%,description.ilike.%tragedy%');
        break;
        
      case 'exciting':
      case 'thrilling':
        // Exciting mood might include action and adventure
        query = query.or('description.ilike.%action%,description.ilike.%adventure%');
        break;
        
      case 'relaxing':
      case 'calm':
        // Relaxing mood might include slice of life or iyashikei (healing) anime
        query = query.or('description.ilike.%slice of life%,description.ilike.%healing%');
        break;
        
      case 'thought-provoking':
      case 'intellectual':
        // Thought-provoking mood might include psychological or philosophical anime
        query = query.or('description.ilike.%psychological%,description.ilike.%philosophical%');
        break;
        
      default:
        // Default to popular anime if mood is not recognized
        query = query.eq('is_popular', true);
    }
    
    // Execute the query with a limit
    const { data, error } = await query.limit(10);
    
    if (error) throw error;
    
    return data || [];
    
  } catch (error) {
    console.error(`Error getting anime for mood "${mood}":`, error);
    toast.error("Failed to find anime matching your mood");
    return [];
  }
};
