
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
import { Activity, BarChart3, Users, Film } from "lucide-react";

// Mock dashboard data
const mockStats = {
  totalAnime: 234,
  totalEpisodes: 4589,
  totalUsers: 1287,
  totalViews: 382947
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

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
    }
  }, [location.pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/admin/${value === "dashboard" ? "dashboard" : value}`);
  };

  return (
    <AdminLayout title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-anime-light">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="anime">Anime</TabsTrigger>
          <TabsTrigger value="episodes">Episodes</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                  <span className="text-3xl font-bold text-white">{mockStats.totalAnime}</span>
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
                  <span className="text-3xl font-bold text-white">{mockStats.totalEpisodes}</span>
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
                  <span className="text-3xl font-bold text-white">{mockStats.totalUsers}</span>
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
                  <span className="text-3xl font-bold text-white">{mockStats.totalViews}</span>
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
                  <PieChart 
                    data={[
                      { name: 'Naruto', value: 32 },
                      { name: 'One Piece', value: 28 },
                      { name: 'Attack on Titan', value: 22 },
                      { name: 'Demon Slayer', value: 15 },
                      { name: 'My Hero Academia', value: 13 }
                    ]}
                    colors={['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2']}
                    category="value"
                    index="name"
                  />
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
                  {/* Mock chart - we would integrate a real chart here */}
                  <div className="flex items-center justify-center h-full text-gray-400">
                    User growth chart would be displayed here
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="anime">
          {/* Anime Management Tab */}
          <Card className="bg-anime-dark border-gray-800">
            <CardHeader>
              <CardTitle>Anime Library</CardTitle>
              <CardDescription>
                Manage your anime collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-400">
                Anime management interface would be here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="episodes">
          {/* Episodes Management Tab */}
          <Card className="bg-anime-dark border-gray-800">
            <CardHeader>
              <CardTitle>Episodes</CardTitle>
              <CardDescription>
                Manage episodes for all your anime series
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-400">
                Episodes management interface would be here
              </div>
            </CardContent>
          </Card>
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
                Settings interface would be here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminDashboard;
