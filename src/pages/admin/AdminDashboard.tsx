
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, AreaChart, PieChart } from "@/components/ui/charts";
import { Film, Users, Tv, Calendar, TrendingUp, Eye, Search, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  getTrendingAnime, 
  searchAnime, 
  importAnimeToDatabase, 
  TMDBAnime 
} from "@/services/tmdbService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [popularityThreshold, setPopularityThreshold] = useState([50]);
  const [ratingThreshold, setRatingThreshold] = useState([7.5]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchAnime(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (anime: TMDBAnime) => {
    setIsImporting(true);
    try {
      const success = await importAnimeToDatabase({
        ...anime,
        popularity: anime.popularity > popularityThreshold[0] ? anime.popularity : popularityThreshold[0],
        vote_average: anime.vote_average > ratingThreshold[0] ? anime.vote_average : ratingThreshold[0]
      });
      
      if (success) {
        // Remove from search results if successfully imported
        setSearchResults(prev => prev.filter(item => item.id !== anime.id));
      }
    } catch (error) {
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
    }
  };
  
  // Mock data for charts
  const barChartData = [
    { name: "Jan", views: 4000 },
    { name: "Feb", views: 3000 },
    { name: "Mar", views: 2000 },
    { name: "Apr", views: 2780 },
    { name: "May", views: 1890 },
    { name: "Jun", views: 2390 },
    { name: "Jul", views: 3490 },
  ];
  
  const areaChartData = [
    { name: "Week 1", users: 400, viewers: 240 },
    { name: "Week 2", users: 300, viewers: 139 },
    { name: "Week 3", users: 200, viewers: 980 },
    { name: "Week 4", users: 278, viewers: 390 },
    { name: "Week 5", users: 189, viewers: 480 },
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
      {/* TMDB Scraper Section */}
      <Card className="bg-anime-light border-gray-800 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-anime-primary" />
            <span>TMDB Anime Scraper</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Popularity Threshold</h3>
                <div className="space-y-2">
                  <Slider
                    value={popularityThreshold}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={setPopularityThreshold}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">
                    Anime with popularity above {popularityThreshold[0]} will be marked as trending
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Rating Threshold</h3>
                <div className="space-y-2">
                  <Slider
                    value={ratingThreshold}
                    min={0}
                    max={10}
                    step={0.1}
                    onValueChange={setRatingThreshold}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-400">
                    Anime with rating above {ratingThreshold[0]} will be marked as popular
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for anime to import..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-anime-dark border-gray-700"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-anime-primary hover:bg-anime-primary/90"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search TMDB
                  </>
                )}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poster</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((anime) => (
                      <TableRow key={anime.id}>
                        <TableCell>
                          {anime.poster_path ? (
                            <img 
                              src={anime.poster_path} 
                              alt={anime.title} 
                              className="w-12 h-16 object-cover rounded-sm"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-anime-dark flex items-center justify-center rounded-sm">
                              <Film size={20} className="text-gray-500" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{anime.title}</TableCell>
                        <TableCell>{anime.vote_average.toFixed(1)}</TableCell>
                        <TableCell>
                          {anime.release_date 
                            ? new Date(anime.release_date).getFullYear() 
                            : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-anime-primary hover:bg-anime-primary/90"
                            onClick={() => handleImport(anime)}
                            disabled={isImporting}
                          >
                            {isImporting ? "Importing..." : "Import"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
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
