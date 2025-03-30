
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, AreaChart, PieChart } from "@/components/ui/chart";
import { Film, Users, Tv, Calendar, TrendingUp, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dashboard loaded",
        description: "Welcome to the admin dashboard",
      });
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
  // Mock data for charts
  const barChartData = [
    {
      name: "Jan",
      views: 4000,
    },
    {
      name: "Feb",
      views: 3000,
    },
    {
      name: "Mar",
      views: 2000,
    },
    {
      name: "Apr",
      views: 2780,
    },
    {
      name: "May",
      views: 1890,
    },
    {
      name: "Jun",
      views: 2390,
    },
    {
      name: "Jul",
      views: 3490,
    },
  ];
  
  const areaChartData = [
    {
      name: "Week 1",
      users: 400,
      viewers: 240,
    },
    {
      name: "Week 2",
      users: 300,
      viewers: 139,
    },
    {
      name: "Week 3",
      users: 200,
      viewers: 980,
    },
    {
      name: "Week 4",
      users: 278,
      viewers: 390,
    },
    {
      name: "Week 5",
      users: 189,
      viewers: 480,
    },
  ];
  
  const pieChartData = [
    { name: "Action", value: 400 },
    { name: "Comedy", value: 300 },
    { name: "Drama", value: 300 },
    { name: "Romance", value: 200 },
    { name: "Sci-Fi", value: 100 },
  ];
  
  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Anime</CardTitle>
            <Film className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-gray-400">+2 added today</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Tv className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-gray-400">+18 added this week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Views</CardTitle>
            <Eye className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2M</div>
            <p className="text-xs text-gray-400">+23% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Users</CardTitle>
            <Users className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.8K</div>
            <p className="text-xs text-gray-400">+42% from yesterday</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-anime-primary" />
              <span>Monthly Views</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={barChartData}
              categories={["views"]}
              index="name"
              colors={["#7661E4"]}
              yAxisWidth={40}
              showAnimation
              className="aspect-[1.5/1]"
            />
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-anime-primary" />
              <span>User Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={areaChartData}
              categories={["users", "viewers"]}
              index="name"
              colors={["#7661E4", "#FF5E4D"]}
              yAxisWidth={40}
              showAnimation
              className="aspect-[1.5/1]"
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-anime-primary" />
              <span>Popular Genres</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <PieChart
                data={pieChartData}
                category="value"
                index="name"
                colors={["#7661E4", "#FF5E4D", "#4ECDC4", "#FF6B6B", "#C44D58"]}
                showAnimation
                className="h-full"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, index) => (
                <div key={index} className="flex items-start gap-4 border-b border-gray-800 pb-4 last:border-b-0 last:pb-0">
                  <div className="w-12 h-12 bg-anime-dark rounded-md flex items-center justify-center text-anime-primary">
                    {index % 2 === 0 ? <Film size={20} /> : <Tv size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {index % 2 === 0 ? "New anime added" : "Episode updated"}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {index % 2 === 0 
                        ? `Added "Anime Title ${index + 1}" to the library` 
                        : `Updated Episode ${index + 1} for "Anime Title"`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {`${index + 1} hour${index !== 0 ? 's' : ''} ago`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
