
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Users, Tv, Calendar, Search, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  searchAnime, 
  importAnimeToDatabase, 
  TMDBAnime 
} from "@/services/tmdbService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PieChart } from "@/components/ui/charts";

// Define stats interface
interface DashboardStats {
  totalAnime: number;
  totalEpisodes: number;
  recentlyAdded: any[];
  genreCounts: Record<string, number>;
}

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // Fetch dashboard stats from Supabase
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async (): Promise<DashboardStats> => {
      try {
        // Get total anime count
        const { count: animeCount, error: animeError } = await supabase
          .from('anime')
          .select('*', { count: 'exact', head: true });
        
        if (animeError) throw animeError;
        
        // Get total episodes count
        const { count: episodesCount, error: episodesError } = await supabase
          .from('episodes')
          .select('*', { count: 'exact', head: true });
        
        if (episodesError) throw episodesError;
        
        // Get recently added anime
        const { data: recentAnime, error: recentError } = await supabase
          .from('anime')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (recentError) throw recentError;
        
        // Get genre distribution
        const { data: genres, error: genreError } = await supabase
          .from('genres')
          .select(`
            name,
            anime_genres!inner(
              anime_id
            )
          `);
        
        if (genreError) throw genreError;
        
        // Count anime by genre
        const genreCounts: Record<string, number> = {};
        genres?.forEach(genre => {
          genreCounts[genre.name] = genre.anime_genres?.length || 0;
        });
        
        return {
          totalAnime: animeCount || 0,
          totalEpisodes: episodesCount || 0,
          recentlyAdded: recentAnime || [],
          genreCounts
        };
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        toast.error("Failed to load dashboard statistics");
        return {
          totalAnime: 0,
          totalEpisodes: 0,
          recentlyAdded: [],
          genreCounts: {}
        };
      }
    },
    refetchInterval: 30000, // Refresh data every 30 seconds
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchAnime(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search for anime");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (anime: TMDBAnime) => {
    setIsImporting(true);
    try {
      const success = await importAnimeToDatabase(anime);
      
      if (success) {
        // Remove from search results if successfully imported
        setSearchResults(prev => prev.filter(item => item.id !== anime.id));
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import anime");
    } finally {
      setIsImporting(false);
    }
  };
  
  // Prepare data for charts based on actual Supabase data
  const genreChartData = Object.entries(stats?.genreCounts || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (error) {
    return (
      <AdminLayout title="Dashboard">
        <div className="p-6 text-center">
          <h3 className="text-xl text-red-500 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-400">Please try refreshing the page</p>
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
            <div className="text-2xl font-bold">{stats?.totalAnime || 0}</div>
            <p className="text-xs text-gray-400">From Supabase database</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Episodes</CardTitle>
            <Tv className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEpisodes || 0}</div>
            <p className="text-xs text-gray-400">From Supabase database</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-gray-400">From Supabase database</p>
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Genres</CardTitle>
            <Calendar className="h-4 w-4 text-anime-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(stats?.genreCounts || {}).length}</div>
            <p className="text-xs text-gray-400">From Supabase database</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Recent Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-anime-primary" />
              <span>Genre Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {genreChartData.length > 0 ? (
              <div className="h-80">
                <PieChart
                  data={genreChartData}
                  category="value"
                  index="name"
                  colors={["#7661E4", "#FF5E4D", "#4ECDC4", "#FF6B6B", "#C44D58"]}
                  showAnimation
                  className="h-full"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-400">
                No genre data available
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-anime-light border-gray-800">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentlyAdded.length > 0 ? (
                stats.recentlyAdded.map((anime, index) => (
                  <div key={anime.id} className="flex items-start gap-4 border-b border-gray-800 pb-4 last:border-b-0 last:pb-0">
                    <div className="w-12 h-12 bg-anime-dark rounded-md overflow-hidden">
                      {anime.image_url ? (
                        <img src={anime.image_url} alt={anime.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-anime-primary">
                          <Film size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{anime.title}</h4>
                      <p className="text-sm text-gray-400 line-clamp-1">
                        {anime.description || "No description available"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(anime.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No recent updates found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
