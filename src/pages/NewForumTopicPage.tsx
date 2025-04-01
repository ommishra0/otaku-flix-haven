
import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTopic } from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

const NewForumTopicPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to create a topic");
      navigate("/auth");
      return;
    }
    
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const topicId = await createTopic(user.id, title, content);
      
      if (topicId) {
        toast.success("Topic created successfully");
        navigate(`/forum/topic/${topicId}`);
      } else {
        toast.error("Failed to create topic");
      }
    } catch (error) {
      console.error("Error creating topic:", error);
      toast.error("An error occurred while creating the topic");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">You need to be logged in to create a new topic.</p>
          <Link to="/auth">
            <Button className="mr-4">Login</Button>
          </Link>
          <Link to="/forum">
            <Button variant="outline">Return to Forum</Button>
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
          <h1 className="text-2xl font-bold text-white mt-4 mb-6">Create New Topic</h1>
        </div>
        
        <div className="bg-anime-dark border border-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your topic about?"
                className="bg-anime-darker border-gray-700"
                maxLength={100}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">Content</label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your topic in detail..."
                className="min-h-[200px] bg-anime-darker border-gray-700"
                required
              />
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                type="submit" 
                className="bg-anime-primary hover:bg-anime-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Topic"}
              </Button>
              <Link to="/forum">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewForumTopicPage;
