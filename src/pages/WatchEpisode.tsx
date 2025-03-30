
import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Share, ThumbsUp, ThumbsDown, MessageSquare, Play } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import AdBanner from "@/components/shared/AdBanner";
import { animeDetails, comments } from "@/data/mockData";

interface CommentProps {
  id: number;
  username: string;
  content: string;
  likes: number;
  dislikes: number;
  timestamp: string;
}

const WatchEpisode = () => {
  const { animeId, episodeId } = useParams<{ animeId: string; episodeId: string }>();
  const [anime, setAnime] = useState<any>(null);
  const [episode, setEpisode] = useState<any>(null);
  const [nextEpisode, setNextEpisode] = useState<any>(null);
  const [prevEpisode, setPrevEpisode] = useState<any>(null);
  const [episodeComments, setEpisodeComments] = useState<CommentProps[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    // Simulate API fetch with a slight delay
    setTimeout(() => {
      if (animeId && episodeId && animeDetails[Number(animeId)]) {
        const animeData = animeDetails[Number(animeId)];
        setAnime(animeData);
        
        // Find current episode
        const currentEpisode = animeData.episodes.find((ep: any) => ep.id === Number(episodeId));
        if (currentEpisode) {
          setEpisode(currentEpisode);
          
          // Find prev episode
          const currentIndex = animeData.episodes.findIndex((ep: any) => ep.id === Number(episodeId));
          if (currentIndex > 0) {
            setPrevEpisode(animeData.episodes[currentIndex - 1]);
          }
          
          // Find next episode
          if (currentIndex < animeData.episodes.length - 1) {
            setNextEpisode(animeData.episodes[currentIndex + 1]);
          }
          
          // Get comments
          if (comments[Number(episodeId)]) {
            setEpisodeComments(comments[Number(episodeId)]);
          }
        }
      }
      setIsLoading(false);
    }, 500);
  }, [animeId, episodeId]);
  
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
  
  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newComment: CommentProps = {
        id: Date.now(),
        username: "Guest",
        content: commentText,
        likes: 0,
        dislikes: 0,
        timestamp: new Date().toISOString()
      };
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
      
      {/* Video Player */}
      <div className="relative bg-black aspect-video mb-6 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white">Video player would appear here</p>
          <Play size={48} className="text-white/50" />
        </div>
        <video 
          ref={videoRef}
          className="w-full h-full hidden"
          controls
          poster={episode.thumbnail}
        >
          <source src={episode.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
                placeholder="Add a comment..."
                className="w-full bg-anime-light p-4 rounded-md border border-gray-700 focus:border-anime-primary focus:outline-none focus:ring-1 focus:ring-anime-primary min-h-[100px]"
              />
              <div className="flex justify-end mt-2">
                <Button type="submit" disabled={!commentText.trim()}>
                  Post Comment
                </Button>
              </div>
            </form>
            
            <div className="space-y-6">
              {episodeComments.map((comment) => (
                <div key={comment.id} className="bg-anime-light p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold">{comment.username}</div>
                    <div className="text-sm text-gray-400">{formatDate(comment.timestamp)}</div>
                  </div>
                  <p className="text-gray-300 mb-3">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
                      <ThumbsUp size={14} />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors">
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
            {anime.episodes.map((ep: any) => (
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
                      <Play size={12} fill="currentColor" />
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
