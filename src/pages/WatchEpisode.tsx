
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Share, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/shared/AdBanner";
import EnhancedVideoPlayer from "@/components/anime/EnhancedVideoPlayer";
import { fetchAnimeAndEpisode, fetchComments, addComment, updateWatchHistory, likeEpisodeComment, dislikeEpisodeComment, Comment } from "@/services/episodeService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const WatchEpisode = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const [anime, setAnime] = useState<any>(null);
  const [episode, setEpisode] = useState<any>(null);
  const [nextEpisode, setNextEpisode] = useState<any>(null);
  const [prevEpisode, setPrevEpisode] = useState<any>(null);
  const [episodeComments, setEpisodeComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    
    fetchUser();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Load anime and episode data
  useEffect(() => {
    const loadData = async () => {
      if (!animeId || !episodeId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Fetch anime and episode data
        const { anime: animeData, episode: episodeData, nextEpisode: next, prevEpisode: prev } = 
          await fetchAnimeAndEpisode(animeId, episodeId);
        
        if (animeData) setAnime(animeData);
        if (episodeData) setEpisode(episodeData);
        if (next) setNextEpisode(next);
        if (prev) setPrevEpisode(prev);
        
        // Fetch comments
        const comments = await fetchComments(episodeId);
        setEpisodeComments(comments);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error",
          description: "Could not load episode data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [animeId, episodeId]);
  
  // Handle video progress tracking
  const handleVideoProgress = (progress: number, completed: boolean) => {
    if (user?.id && episodeId) {
      updateWatchHistory(user.id, episodeId, progress, completed);
    }
  };
  
  const handleVideoError = (error: any) => {
    console.error("Video playback error:", error);
    toast({
      title: "Playback Error",
      description: "There was an error playing this video. Please try again later.",
      variant: "destructive",
    });
  };
  
  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
    } else {
      setIsLiked(true);
      setIsDisliked(false);
    }
  };
  
  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      setIsLiked(false);
    }
  };
  
  const handleCommentLike = async (commentId: string, isCurrentlyLiked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to like comments",
        variant: "destructive",
      });
      return;
    }
    
    const success = await likeEpisodeComment(commentId, isCurrentlyLiked);
    
    if (success) {
      setEpisodeComments(comments => 
        comments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1 
              } 
            : comment
        )
      );
    }
  };
  
  const handleCommentDislike = async (commentId: string, isCurrentlyDisliked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to dislike comments",
        variant: "destructive",
      });
      return;
    }
    
    const success = await dislikeEpisodeComment(commentId, isCurrentlyDisliked);
    
    if (success) {
      setEpisodeComments(comments => 
        comments.map(comment => 
          comment.id === commentId 
            ? { 
                ...comment, 
                dislikes: isCurrentlyDisliked ? comment.dislikes - 1 : comment.dislikes + 1 
              } 
            : comment
        )
      );
    }
  };
  
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    
    // Add comment to database
    const newComment = await addComment(user.id, episodeId as string, commentText);
    
    if (newComment) {
      setEpisodeComments([newComment, ...episodeComments]);
      setCommentText("");
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!anime || !episode) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Episode Not Found</h1>
          <p className="text-gray-400 mb-6">The episode you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button variant="default">Return to Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  // Prepare quality options if available
  const qualityOptions = episode.quality_options || [];
  
  // Prepare subtitles if available
  const subtitles = episode.subtitles || [];
  
  return (
    <MainLayout>
      <div className="mb-4">
        <Link 
          to={`/anime/${animeId}`}
          className="flex items-center text-anime-primary hover:underline"
        >
          <ChevronLeft size={16} />
          <span>Back to {anime.title}</span>
        </Link>
      </div>
      
      {/* Enhanced Video Player */}
      <div className="relative bg-black aspect-video mb-6 rounded-lg overflow-hidden">
        {episode.embed_code ? (
          // Render embedded player (Filemoon, StreamTab, etc.)
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: episode.embed_code }} 
          />
        ) : episode.video_url ? (
          // Render enhanced video player if direct video URL exists
          <EnhancedVideoPlayer
            videoUrl={episode.video_url}
            poster={episode.thumbnail_url}
            subtitles={subtitles}
            qualityOptions={qualityOptions}
            onProgress={handleVideoProgress}
            onError={handleVideoError}
          />
        ) : (
          // Placeholder if no video source is available
          <div className="absolute inset-0 flex items-center justify-center bg-anime-dark">
            <p className="text-white text-center">
              Video not available
              <br />
              <span className="text-sm text-gray-400">This episode doesn't have a video source yet.</span>
            </p>
          </div>
        )}
      </div>
      
      <AdBanner position="top" className="h-20 -mx-4 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Episode Navigation */}
          <div className="flex justify-between items-center mb-6">
            {prevEpisode ? (
              <Link 
                to={`/watch/${animeId}/${prevEpisode.id}`}
                className="flex items-center gap-1 text-gray-300 hover:text-anime-primary transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Previous Episode</span>
              </Link>
            ) : (
              <div></div>
            )}
            
            <div className="text-center">
              <span className="text-sm text-gray-400">Episode {episode.number}</span>
            </div>
            
            {nextEpisode ? (
              <Link 
                to={`/watch/${animeId}/${nextEpisode.id}`}
                className="flex items-center gap-1 text-gray-300 hover:text-anime-primary transition-colors"
              >
                <span>Next Episode</span>
                <ChevronRight size={16} />
              </Link>
            ) : (
              <div></div>
            )}
          </div>
          
          {/* Episode Info */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {anime.title} - {episode.title}
            </h1>
            <p className="text-gray-300 mb-4">{episode.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button 
                  variant={isLiked ? "default" : "outline"} 
                  className={`flex items-center gap-1 ${isLiked ? 'bg-anime-primary' : ''}`}
                  onClick={handleLike}
                >
                  <ThumbsUp size={16} />
                  <span>Like</span>
                </Button>
                
                <Button 
                  variant={isDisliked ? "default" : "outline"} 
                  className={`flex items-center gap-1 ${isDisliked ? 'bg-anime-primary' : ''}`}
                  onClick={handleDislike}
                >
                  <ThumbsDown size={16} />
                  <span>Dislike</span>
                </Button>
              </div>
              
              <Button variant="outline" className="flex items-center gap-1">
                <Share size={16} />
                <span>Share</span>
              </Button>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <MessageSquare size={20} />
              <span>Comments</span>
              <span className="text-gray-400">({episodeComments.length})</span>
            </h2>
            
            <form onSubmit={handleComment} className="mb-8">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "Add a comment..." : "Login to comment"}
                className="w-full bg-anime-light p-4 rounded-md border border-gray-700 focus:border-anime-primary focus:outline-none focus:ring-1 focus:ring-anime-primary min-h-[100px]"
                disabled={!user}
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!commentText.trim() || !user}>
                  Post Comment
                </Button>
              </div>
            </form>
            
            <div className="space-y-6">
              {episodeComments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-4 rounded-md ${
                    comment.is_highlighted 
                      ? 'bg-anime-primary/20 border border-anime-primary/50' 
                      : 'bg-anime-light'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold flex items-center gap-2">
                      {comment.username}
                      {comment.is_pinned && (
                        <span className="bg-anime-primary/20 text-anime-primary px-2 py-0.5 text-xs rounded-full">
                          Pinned
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{formatDate(comment.timestamp)}</div>
                  </div>
                  <p className="text-gray-300 mb-3">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <button 
                      className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      onClick={() => handleCommentLike(comment.id, false)}
                    >
                      <ThumbsUp size={14} />
                      <span>{comment.likes}</span>
                    </button>
                    <button 
                      className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                      onClick={() => handleCommentDislike(comment.id, false)}
                    >
                      <ThumbsDown size={14} />
                      <span>{comment.dislikes}</span>
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">Reply</button>
                  </div>
                </div>
              ))}
              
              {episodeComments.length === 0 && (
                <div className="text-center py-6 text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4">More Episodes</h3>
          <div className="space-y-3">
            {anime.episodes?.map((ep: any) => (
              <Link 
                key={ep.id}
                to={`/watch/${animeId}/${ep.id}`}
                className={`block p-3 rounded-md transition-colors ${
                  ep.id === episode.id ? 'bg-anime-primary text-white' : 'bg-anime-light hover:bg-anime-light/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20">
                    {ep.id === episode.id ? (
                      <ChevronRight size={12} fill="currentColor" />
                    ) : (
                      ep.number
                    )}
                  </div>
                  <span className="line-clamp-1">{ep.title}</span>
                </div>
              </Link>
            ))}
          </div>
          
          <AdBanner position="sidebar" className="mt-8 h-[400px]" />
        </div>
      </div>
    </MainLayout>
  );
};

export default WatchEpisode;
