
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  is_pinned: boolean;
  is_locked: boolean;
  username?: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  upvotes: number;
  downvotes: number;
  is_best_answer: boolean;
  username?: string;
}

// Fetch all forum topics
export const fetchAllTopics = async (): Promise<ForumTopic[]> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(topic => ({
      ...topic,
      username: topic.profiles?.username || 'Anonymous'
    })) || [];
  } catch (error) {
    console.error('Error fetching forum topics:', error);
    toast.error("Failed to load forum topics");
    return [];
  }
};

// Fetch a single topic with its replies
export const fetchTopicWithReplies = async (topicId: string): Promise<{topic: ForumTopic | null, replies: ForumReply[]}> => {
  try {
    // Fetch the topic
    const { data: topicData, error: topicError } = await supabase
      .from('forum_topics')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('id', topicId)
      .single();
    
    if (topicError) throw topicError;
    
    const topic = {
      ...topicData,
      username: topicData.profiles?.username || 'Anonymous'
    };
    
    // Fetch the replies
    const { data: repliesData, error: repliesError } = await supabase
      .from('forum_replies')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('topic_id', topicId)
      .order('is_best_answer', { ascending: false })
      .order('created_at', { ascending: true });
    
    if (repliesError) throw repliesError;
    
    const replies = repliesData.map(reply => ({
      ...reply,
      username: reply.profiles?.username || 'Anonymous'
    })) || [];
    
    return { topic, replies };
  } catch (error) {
    console.error('Error fetching topic with replies:', error);
    toast.error("Failed to load topic and replies");
    return { topic: null, replies: [] };
  }
};

// Create a new topic
export const createTopic = async (
  userId: string,
  title: string,
  content: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .insert({
        title,
        content,
        user_id: userId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    toast.success("Topic created successfully");
    return data.id;
  } catch (error) {
    console.error('Error creating topic:', error);
    toast.error("Failed to create topic");
    return null;
  }
};

// Create a reply to a topic
export const createReply = async (
  userId: string,
  topicId: string,
  content: string
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert({
        topic_id: topicId,
        content,
        user_id: userId
      })
      .select('id')
      .single();
    
    if (error) throw error;
    
    toast.success("Reply posted successfully");
    return data.id;
  } catch (error) {
    console.error('Error creating reply:', error);
    toast.error("Failed to post reply");
    return null;
  }
};

// Vote on a topic
export const voteOnTopic = async (
  topicId: string,
  isUpvote: boolean
): Promise<boolean> => {
  try {
    // First get current vote counts
    const { data: topicData, error: fetchError } = await supabase
      .from('forum_topics')
      .select('upvotes, downvotes')
      .eq('id', topicId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update the appropriate vote count
    const updates = isUpvote
      ? { upvotes: (topicData.upvotes || 0) + 1 }
      : { downvotes: (topicData.downvotes || 0) + 1 };
    
    const { error: updateError } = await supabase
      .from('forum_topics')
      .update(updates)
      .eq('id', topicId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error voting on topic:', error);
    toast.error("Failed to register vote");
    return false;
  }
};

// Vote on a reply
export const voteOnReply = async (
  replyId: string,
  isUpvote: boolean
): Promise<boolean> => {
  try {
    // First get current vote counts
    const { data: replyData, error: fetchError } = await supabase
      .from('forum_replies')
      .select('upvotes, downvotes')
      .eq('id', replyId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Update the appropriate vote count
    const updates = isUpvote
      ? { upvotes: (replyData.upvotes || 0) + 1 }
      : { downvotes: (replyData.downvotes || 0) + 1 };
    
    const { error: updateError } = await supabase
      .from('forum_replies')
      .update(updates)
      .eq('id', replyId);
    
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error voting on reply:', error);
    toast.error("Failed to register vote");
    return false;
  }
};

// Mark a reply as the best answer
export const markAsBestAnswer = async (
  replyId: string,
  topicId: string
): Promise<boolean> => {
  try {
    // First, unmark any existing best answers
    const { error: resetError } = await supabase
      .from('forum_replies')
      .update({ is_best_answer: false })
      .eq('topic_id', topicId)
      .eq('is_best_answer', true);
    
    if (resetError) throw resetError;
    
    // Then mark the new best answer
    const { error: markError } = await supabase
      .from('forum_replies')
      .update({ is_best_answer: true })
      .eq('id', replyId);
    
    if (markError) throw markError;
    
    toast.success("Answer marked as the best solution");
    return true;
  } catch (error) {
    console.error('Error marking best answer:', error);
    toast.error("Failed to mark best answer");
    return false;
  }
};

// Pin or unpin a topic
export const togglePinTopic = async (
  topicId: string,
  shouldPin: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_topics')
      .update({ is_pinned: shouldPin })
      .eq('id', topicId);
    
    if (error) throw error;
    
    toast.success(shouldPin ? "Topic pinned successfully" : "Topic unpinned successfully");
    return true;
  } catch (error) {
    console.error('Error toggling pin status:', error);
    toast.error("Failed to update pin status");
    return false;
  }
};

// Lock or unlock a topic
export const toggleLockTopic = async (
  topicId: string,
  shouldLock: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('forum_topics')
      .update({ is_locked: shouldLock })
      .eq('id', topicId);
    
    if (error) throw error;
    
    toast.success(shouldLock ? "Topic locked successfully" : "Topic unlocked successfully");
    return true;
  } catch (error) {
    console.error('Error toggling lock status:', error);
    toast.error("Failed to update lock status");
    return false;
  }
};
