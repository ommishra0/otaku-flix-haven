
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryManagement from "@/components/admin/CategoryManagement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart } from "@/components/ui/charts";
import { Activity, BarChart3, Users, Film, Download, Import } from "lucide-react";
import AnimeManagement from "@/components/admin/AnimeManagement";
import EpisodeManagement from "@/components/admin/EpisodeManagement";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboardStats, setDashboardStats] = useState({
    totalAnime: 0,
    totalEpisodes: 0,
    totalUsers: 0,
    totalViews: 0
  });
  const [popularAnimeData, setPopularAnimeData] = useState<{name: string, value: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set active tab based on current path
    const path = location.pathname;
    if (path.includes("/admin/anime")) {
      setActiveTab("anime");
    } else if (path.includes("/admin/episodes")) {
      setActiveTab("episodes");
    } else if (path.includes("/admin/categories")) {
      setActiveTab("categories");
    } else if (path.includes("/admin/settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("dashboard");
      // Load dashboard data
      fetchDashboardData();
    }
  }, [location.pathname]);

  useEffect(() => {
    // Check if admin is authenticated
    if (!isAdminAuthenticated) {
      toast.error("You must be logged in as an administrator");
      navigate("/admin/login");
    }
  }, [isAdminAuthenticated, navigate]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch total anime count
      const { count: animeCount, error: animeError } = await supabase
        .from('anime')
        .select('*', { count: 'exact', head: true });
      
      if (animeError) throw animeError;
      
      // Fetch total episodes count
      const { count: episodesCount, error: episodesError } = await supabase
        .from('episodes')
        .select('*', { count: 'exact', head: true });
      
      if (episodesError) throw episodesError;
      
      // Fetch total users count
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (usersError) throw usersError;
      
      // Fetch total watch history count as proxy for views
      const { count: viewsCount, error: viewsError } = await supabase
        .from('watch_history')
        .select('*', { count: 'exact', head: true });
      
      if (viewsError) throw viewsError;
      
      // Fetch popular anime data
      const { data: animeData, error: popularError } = await supabase
        .from('episodes')
        .select(`
          anime:anime_id (
            id,
            title
          ),
          count:id
        `)
        .not('anime_id', 'is', null)
        .order('count', { ascending: false })
        .limit(5);
      
      if (popularError) throw popularError;
      
      // Format the data for the pie chart
      const popularAnimeChart = animeData
        .filter(item => item.anime && item.anime.title) // Filter out any null values
        .map(item => ({
          name: item.anime.title,
          value: parseInt(item.count) || 1 // Ensure we have a number
        }));
      
      // Update state with all fetched data
      setDashboardStats({
        totalAnime: animeCount || 0,
        totalEpisodes: episodesCount || 0,
        totalUsers: usersCount || 0,
        totalViews: viewsCount || 0
      });
      
      setPopularAnimeData(popularAnimeChart.length > 0 ? popularAnimeChart : [
        { name: 'No Data', value: 1 } // Fallback if no data
      ]);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value === "dashboard" ? "dashboard" : value}`);
  };

  const handleNavigateToImport = () => {
    navigate("/admin/import");
  };

  return (
    <AdminLayout title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className={`bg-anime-light ${isMobile ? 'w-full flex' : ''}`}>
          <TabsTrigger value="dashboard" className={isMobile ? 'flex-1 text-xs' : ''}>Dashboard</TabsTrigger>
          <TabsTrigger value="anime" className={isMobile ? 'flex-1 text-xs' : ''}>Anime</TabsTrigger>
          <TabsTrigger value="episodes" className={isMobile ? 'flex-1 text-xs' : ''}>Episodes</TabsTrigger>
          <TabsTrigger value="categories" className={isMobile ? 'flex-1 text-xs' : ''}>Categories</TabsTrigger>
          <TabsTrigger value="settings" className={isMobile ? 'flex-1 text-xs' : ''}>Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-300">Total Anime</CardTitle>
                <CardDescription>All anime in library</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{dashboardStats.totalAnime}</span>
                  <Film className="h-8 w-8 text-anime-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-300">Total Episodes</CardTitle>
                <CardDescription>Available episodes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{dashboardStats.totalEpisodes}</span>
                  <BarChart3 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-300">Registered Users</CardTitle>
                <CardDescription>Total user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{dashboardStats.totalUsers}</span>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-300">Total Views</CardTitle>
                <CardDescription>Episode views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">{dashboardStats.totalViews}</span>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Most Popular Anime</CardTitle>
                <CardDescription>Top 5 most watched anime</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-anime-primary"></div>
                    </div>
                  ) : (
                    <PieChart 
                      data={popularAnimeData}
                      colors={['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2']}
                      index="name"
                      category="value"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">User Growth</CardTitle>
                <CardDescription>New users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {/* This would be replaced with actual user growth data */}
                  <div className="flex items-center justify-center h-full text-gray-400">
                    User growth chart will be available soon
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="anime">
          {/* Anime Management Tab */}
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Anime Management</h2>
            <Button 
              onClick={handleNavigateToImport}
              variant="default"
              className="bg-anime-primary hover:bg-anime-primary-darker"
            >
              <Import className="h-4 w-4 mr-2" />
              Import Anime
            </Button>
          </div>
          <AnimeManagement />
        </TabsContent>
        
        <TabsContent value="episodes">
          {/* Episodes Management Tab */}
          <EpisodeManagement />
        </TabsContent>
        
        <TabsContent value="categories">
          {/* Categories Management Tab */}
          <CategoryManagement />
        </TabsContent>
        
        <TabsContent value="settings">
          {/* Settings Tab */}
          <Card className="bg-anime-dark border-gray-800">
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Configure your anime streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-400">
                Settings interface will be available soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
