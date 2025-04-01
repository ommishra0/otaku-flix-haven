
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { fetchAllTopics, ForumTopic } from "@/services/forumService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUp, ArrowDown, PinIcon, LockIcon, MessageCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ForumPage = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadTopics = async () => {
      setLoading(true);
      const data = await fetchAllTopics();
      setTopics(data);
      setLoading(false);
    };

    loadTopics();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Anime Community Forum</h1>
          {user ? (
            <Link to="/forum/new">
              <Button className="bg-anime-primary hover:bg-anime-primary/90">New Topic</Button>
            </Link>
          ) : (
            <Link to="/auth">
              <Button variant="outline">Login to Create Topic</Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <Card key={topic.id} className="bg-anime-dark border-gray-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Link to={`/forum/topic/${topic.id}`}>
                        <CardTitle className="text-white hover:text-anime-primary transition-colors flex items-center">
                          {topic.is_pinned && <PinIcon className="h-4 w-4 text-yellow-500 mr-2" />}
                          {topic.is_locked && <LockIcon className="h-4 w-4 text-red-500 mr-2" />}
                          {topic.title}
                        </CardTitle>
                      </Link>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <ArrowUp className="h-4 w-4" />
                        <span>{topic.upvotes || 0}</span>
                        <ArrowDown className="h-4 w-4 ml-2" />
                        <span>{topic.downvotes || 0}</span>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      Posted by {topic.username} • {formatDate(topic.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-gray-300 line-clamp-2">{topic.content}</p>
                  </CardContent>
                  <CardFooter className="pt-0 text-sm text-gray-400 flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span className="mr-4">0 replies</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Last activity {formatDate(topic.updated_at)}</span>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-anime-dark rounded-lg border border-gray-800">
                <h3 className="text-xl font-medium text-white mb-2">No topics yet</h3>
                <p className="text-gray-400 mb-6">Be the first to start a discussion in our community!</p>
                {user ? (
                  <Link to="/forum/new">
                    <Button className="bg-anime-primary hover:bg-anime-primary/90">Create First Topic</Button>
                  </Link>
                ) : (
                  <Link to="/auth">
                    <Button variant="outline">Login to Create Topic</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ForumPage;
