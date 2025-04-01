
import { useState, useEffect, FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import {
  fetchTopicWithReplies,
  ForumTopic,
  ForumReply,
  createReply,
  voteOnTopic,
  voteOnReply,
  markAsBestAnswer,
  toggleLockTopic,
  togglePinTopic
} from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Award,
  PinIcon,
  LockIcon,
  AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ForumTopicPage = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = true; // TODO: Replace with actual admin check

  useEffect(() => {
    const loadTopicData = async () => {
      if (!id) return;
      
      setLoading(true);
      const { topic: topicData, replies: repliesData } = await fetchTopicWithReplies(id);
      setTopic(topicData);
      setReplies(repliesData);
      setLoading(false);
    };

    loadTopicData();
  }, [id]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  const handleSubmitReply = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user || !id || !replyContent.trim()) {
      toast.error("You must be logged in and provide content to reply");
      return;
    }
    
    if (topic?.is_locked) {
      toast.error("This topic is locked and cannot receive new replies");
      return;
    }
    
    const replyId = await createReply(user.id, id, replyContent);
    
    if (replyId) {
      // Refresh data
      const { replies: updatedReplies } = await fetchTopicWithReplies(id);
      setReplies(updatedReplies);
      setReplyContent("");
    }
  };

  const handleTopicVote = async (isUpvote: boolean) => {
    if (!user || !id) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    const success = await voteOnTopic(id, isUpvote);
    
    if (success && topic) {
      // Update local state to reflect vote
      setTopic({
        ...topic,
        upvotes: isUpvote ? (topic.upvotes || 0) + 1 : topic.upvotes,
        downvotes: !isUpvote ? (topic.downvotes || 0) + 1 : topic.downvotes
      });
    }
  };

  const handleReplyVote = async (replyId: string, isUpvote: boolean) => {
    if (!user) {
      toast.error("You must be logged in to vote");
      return;
    }
    
    const success = await voteOnReply(replyId, isUpvote);
    
    if (success) {
      // Update local state to reflect vote
      setReplies(replies.map(reply => 
        reply.id === replyId
          ? {
              ...reply,
              upvotes: isUpvote ? (reply.upvotes || 0) + 1 : reply.upvotes,
              downvotes: !isUpvote ? (reply.downvotes || 0) + 1 : reply.downvotes
            }
          : reply
      ));
    }
  };

  const handleMarkBestAnswer = async (replyId: string) => {
    if (!user || !id || !topic) {
      toast.error("You must be logged in to mark best answer");
      return;
    }
    
    // Only topic author or admins can mark best answer
    if (user.id !== topic.user_id && !isAdmin) {
      toast.error("Only the topic author or administrators can mark the best answer");
      return;
    }
    
    const success = await markAsBestAnswer(replyId, id);
    
    if (success) {
      // Update local state to reflect changes
      setReplies(replies.map(reply => ({
        ...reply,
        is_best_answer: reply.id === replyId
      })));
    }
  };

  const handleTogglePinTopic = async () => {
    if (!isAdmin || !id || !topic) return;
    
    const success = await togglePinTopic(id, !topic.is_pinned);
    
    if (success) {
      setTopic({
        ...topic,
        is_pinned: !topic.is_pinned
      });
    }
  };

  const handleToggleLockTopic = async () => {
    if (!isAdmin || !id || !topic) return;
    
    const success = await toggleLockTopic(id, !topic.is_locked);
    
    if (success) {
      setTopic({
        ...topic,
        is_locked: !topic.is_locked
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!topic) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Topic Not Found</h2>
          <p className="text-gray-400 mb-6">This topic may have been removed or doesn't exist.</p>
          <Link to="/forum">
            <Button>Return to Forum</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/forum" className="text-anime-primary hover:underline">
            ← Back to Forum
          </Link>
        </div>
        
        {/* Topic Card */}
        <Card className="mb-8 bg-anime-dark border-gray-800">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-xl md:text-2xl text-white flex items-center">
                {topic.is_pinned && <PinIcon className="h-5 w-5 text-yellow-500 mr-2" />}
                {topic.is_locked && <LockIcon className="h-5 w-5 text-red-500 mr-2" />}
                {topic.title}
              </CardTitle>
              <div className="flex items-center mt-2 text-sm text-gray-400">
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarFallback>{topic.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span>{topic.username}</span>
                <span className="mx-2">•</span>
                <span>{formatDate(topic.created_at)}</span>
              </div>
            </div>
            
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">Manage</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleTogglePinTopic}>
                    {topic.is_pinned ? "Unpin Topic" : "Pin Topic"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleToggleLockTopic}>
                    {topic.is_locked ? "Unlock Topic" : "Lock Topic"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </CardHeader>
          <CardContent>
            <div className="text-gray-200 whitespace-pre-line">
              {topic.content}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center text-sm text-gray-400">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{replies.length} replies</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleTopicVote(true)}
                disabled={!user}
                className="flex items-center text-gray-400 hover:text-green-500 disabled:opacity-50"
              >
                <ArrowUp className="h-5 w-5 mr-1" />
                <span>{topic.upvotes || 0}</span>
              </button>
              <button 
                onClick={() => handleTopicVote(false)}
                disabled={!user}
                className="flex items-center text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                <ArrowDown className="h-5 w-5 mr-1" />
                <span>{topic.downvotes || 0}</span>
              </button>
            </div>
          </CardFooter>
        </Card>
        
        {/* Replies */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-white mb-4">{replies.length} Replies</h3>
          
          {replies.length > 0 ? (
            replies.map((reply) => (
              <Card 
                key={reply.id} 
                className={`bg-anime-dark border-gray-800 ${reply.is_best_answer ? 'border-l-4 border-l-green-500' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center text-sm text-gray-400">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>{reply.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <span>{reply.username}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(reply.created_at)}</span>
                      
                      {reply.is_best_answer && (
                        <div className="ml-2 px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full text-xs flex items-center">
                          <Award className="h-3 w-3 mr-1" />
                          Best Answer
                        </div>
                      )}
                    </div>
                    
                    {user && user.id === topic.user_id && !reply.is_best_answer && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMarkBestAnswer(reply.id)}
                        className="text-xs"
                      >
                        <Award className="h-4 w-4 mr-1" />
                        Mark as Best
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-200 whitespace-pre-line">
                    {reply.content}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleReplyVote(reply.id, true)}
                      disabled={!user}
                      className="flex items-center text-gray-400 hover:text-green-500 disabled:opacity-50"
                    >
                      <ArrowUp className="h-5 w-5 mr-1" />
                      <span>{reply.upvotes || 0}</span>
                    </button>
                    <button 
                      onClick={() => handleReplyVote(reply.id, false)}
                      disabled={!user}
                      className="flex items-center text-gray-400 hover:text-red-500 disabled:opacity-50"
                    >
                      <ArrowDown className="h-5 w-5 mr-1" />
                      <span>{reply.downvotes || 0}</span>
                    </button>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 bg-anime-dark/50 rounded-lg border border-gray-800">
              <p className="text-gray-400">No replies yet. Be the first to reply!</p>
            </div>
          )}
        </div>
        
        {/* Reply Form */}
        {!topic.is_locked ? (
          user ? (
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Post a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReply}>
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="min-h-[120px] mb-4"
                    required
                  />
                  <Button 
                    type="submit" 
                    className="bg-anime-primary hover:bg-anime-primary/90"
                    disabled={!replyContent.trim()}
                  >
                    Post Reply
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-anime-dark border-gray-800 text-center py-6">
              <CardContent>
                <p className="text-gray-400 mb-4">You need to be logged in to reply to this topic.</p>
                <Link to="/auth">
                  <Button variant="outline">Login to Reply</Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="bg-anime-dark border-gray-800 text-center py-6">
            <CardContent>
              <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
                <LockIcon className="h-5 w-5" />
                <p className="font-medium">This topic is locked</p>
              </div>
              <p className="text-gray-500">New replies are no longer accepted.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ForumTopicPage;
