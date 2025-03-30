
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Comment {
  id: string;
  username: string;
  content: string;
  likes: number;
  dislikes: number;
  timestamp: string;
  is_pinned?: boolean;
  is_highlighted?: boolean;
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  number: number;
  thumbnail_url: string | null;
  video_url: string | null;
}

export interface Anime {
  id: string;
  title: string;
  episodes: Episode[];
}

export const fetchAnimeAndEpisode = async (animeId: string, episodeId: string) => {
  try {
    // Fetch anime details
    const { data: animeData, error: animeError } = await supabase
      .from('anime')
      .select('id, title')
      .eq('id', animeId)
      .single();

    if (animeError) throw animeError;

    // Fetch current episode
    const { data: episodeData, error: episodeError } = await supabase
      .from('episodes')
      .select('*')
      .eq('id', episodeId)
      .single();

    if (episodeError) throw episodeError;

    // Fetch all episodes for this anime
    const { data: allEpisodes, error: allEpisodesError } = await supabase
      .from('episodes')
      .select('*')
      .eq('anime_id', animeId)
      .order('number', { ascending: true });

    if (allEpisodesError) throw allEpisodesError;

    // Find next and previous episodes
    const currentIndex = allEpisodes.findIndex(ep => ep.id === episodeId);
    const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
    const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

    // Combine data
    const anime = {
      ...animeData,
      episodes: allEpisodes
    };

    return { anime, episode: episodeData, prevEpisode, nextEpisode };
  } catch (error) {
    console.error('Error fetching anime and episode:', error);
    toast({
      title: "Error",
      description: "Failed to load anime data",
      variant: "destructive"
    });
    return { anime: null, episode: null, prevEpisode: null, nextEpisode: null };
  }
};

export const fetchComments = async (episodeId: string) => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        likes,
        dislikes,
        is_pinned,
        is_highlighted,
        created_at,
        profiles (username)
      `)
      .eq('episode_id', episodeId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Format the comments
    const formattedComments: Comment[] = data.map(comment => ({
      id: comment.id,
      username: comment.profiles?.username || 'Anonymous',
      content: comment.content,
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      timestamp: comment.created_at,
      is_pinned: comment.is_pinned,
      is_highlighted: comment.is_highlighted
    }));

    return formattedComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    toast({
      title: "Error",
      description: "Failed to load comments",
      variant: "destructive"
    });
    return [];
  }
};

export const addComment = async (userId: string | null, episodeId: string, content: string) => {
  if (!userId) {
    toast({
      title: "Authentication required",
      description: "You must be logged in to comment",
      variant: "destructive"
    });
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        user_id: userId,
        episode_id: episodeId,
        content
      })
      .select(`
        id, 
        content, 
        likes, 
        dislikes, 
        is_pinned, 
        is_highlighted, 
        created_at,
        profiles (username)
      `)
      .single();

    if (error) throw error;

    const formattedComment: Comment = {
      id: data.id,
      username: data.profiles?.username || 'Anonymous',
      content: data.content,
      likes: data.likes || 0,
      dislikes: data.dislikes || 0,
      timestamp: data.created_at,
      is_pinned: data.is_pinned,
      is_highlighted: data.is_highlighted
    };

    return formattedComment;
  } catch (error) {
    console.error('Error adding comment:', error);
    toast({
      title: "Error",
      description: "Failed to post comment",
      variant: "destructive"
    });
    return null;
  }
};

export const updateWatchHistory = async (userId: string | null, episodeId: string, progress: number, completed: boolean) => {
  if (!userId) return;

  try {
    const { error } = await supabase
      .from('watch_history')
      .upsert({
        user_id: userId,
        episode_id: episodeId,
        progress_seconds: progress,
        completed,
        watched_at: new Date().toISOString()
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating watch history:', error);
  }
};

export const likeEpisodeComment = async (commentId: string, currentLiked: boolean) => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        likes: currentLiked ? supabase.rpc('decrement', { x: 1 }) : supabase.rpc('increment', { x: 1 }) 
      })
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating comment like:', error);
    return false;
  }
};

export const dislikeEpisodeComment = async (commentId: string, currentDisliked: boolean) => {
  try {
    const { error } = await supabase
      .from('comments')
      .update({ 
        dislikes: currentDisliked ? supabase.rpc('decrement', { x: 1 }) : supabase.rpc('increment', { x: 1 }) 
      })
      .eq('id', commentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating comment dislike:', error);
    return false;
  }
};
