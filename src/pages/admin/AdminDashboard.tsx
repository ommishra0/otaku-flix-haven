
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, Users, Tv, Calendar, Search, Download, Plus, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  searchAnime, 
  importAnimeToDatabase,
  bulkImportTrendingAnime,
  addCustomAnime,
  addEpisodeWithEmbed,
  TMDBAnime 
} from "@/services/tmdbService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PieChart } from "@/components/ui/charts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from "@/components/ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Define stats interface
interface DashboardStats {
  totalAnime: number;
  totalEpisodes: number;
  recentlyAdded: any[];
  genreCounts: Record<string, number>;
}

// Custom anime form schema
const customAnimeSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional().or(z.literal("")),
  bannerImageUrl: z.string().url({ message: "Please enter a valid banner image URL" }).optional().or(z.literal("")),
  releaseYear: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

// Episode form schema
const episodeSchema = z.object({
  animeId: z.string().uuid({ message: "Please select an anime" }),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  number: z.coerce.number(), // Fixed: Use coerce.number() instead of string transformation
  description: z.string().optional(),
  thumbnailUrl: z.string().url({ message: "Please enter a valid thumbnail URL" }).optional().or(z.literal("")),
  embedProvider: z.string().optional(),
  embedCode: z.string().optional(),
});

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [animeList, setAnimeList] = useState<any[]>([]);

  // Custom anime form
  const customAnimeForm = useForm<z.infer<typeof customAnimeSchema>>({
    resolver: zodResolver(customAnimeSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      bannerImageUrl: "",
      releaseYear: "",
      type: "TV Series",
      status: "Ongoing",
    },
  });

  // Episode form
  const episodeForm = useForm<z.infer<typeof episodeSchema>>({
    resolver: zodResolver(episodeSchema),
    defaultValues: {
      animeId: "",
      title: "",
      number: "1",
      description: "",
      thumbnailUrl: "",
      embedProvider: "",
      embedCode: "",
    },
  });
  
  // Fetch all anime for the episode form dropdown
  const fetchAnimeList = async () => {
    const { data, error } = await supabase
      .from('anime')
      .select('id, title')
      .order('title', { ascending: true });
    
    if (error) {
      console.error("Error fetching anime list:", error);
      toast.error("Failed to load anime list");
      return [];
    }
    
    setAnimeList(data || []);
    return data || [];
  };
  
  // Fetch dashboard stats from Supabase
  const { data: stats, isLoading, error, refetch } = useQuery({
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

        // Fetch anime list for forms
        await fetchAnimeList();
        
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

  const handleBulkImport = async () => {
    setIsBulkImporting(true);
    try {
      const importCount = await bulkImportTrendingAnime();
      if (importCount > 0) {
        // Refetch data to update stats
        await refetch();
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      toast.error("Failed to bulk import trending anime");
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleCustomAnimeSubmit = async (data: z.infer<typeof customAnimeSchema>) => {
    try {
      const animeId = await addCustomAnime({
        title: data.title,
        description: data.description,
        imageUrl: data.imageUrl,
        bannerImageUrl: data.bannerImageUrl,
        releaseYear: data.releaseYear,
        type: data.type,
        status: data.status
      });
      
      if (animeId) {
        customAnimeForm.reset();
        // Refetch data to update stats
        await refetch();
      }
    } catch (error) {
      console.error("Custom anime creation error:", error);
      toast.error("Failed to create custom anime");
    }
  };

  const handleEpisodeSubmit = async (data: z.infer<typeof episodeSchema>) => {
    try {
      const episodeId = await addEpisodeWithEmbed(
        data.animeId,
        {
          title: data.title,
          number: data.number, // Fixed: Now number is already coerced to a number
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          embedProvider: data.embedProvider,
          embedCode: data.embedCode
        }
      );
      
      if (episodeId) {
        episodeForm.reset();
        // Refetch data to update stats
        await refetch();
      }
    } catch (error) {
      console.error("Episode creation error:", error);
      toast.error("Failed to create episode");
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
      <Tabs defaultValue="import" className="mb-8">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="import">TMDB Import</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="custom">Custom Anime</TabsTrigger>
          <TabsTrigger value="episode">Add Episode</TabsTrigger>
        </TabsList>
        
        {/* TMDB Import Tab */}
        <TabsContent value="import">
          <Card className="bg-anime-light border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-anime-primary" />
                <span>TMDB Anime Importer</span>
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
        </TabsContent>
        
        {/* Bulk Import Tab */}
        <TabsContent value="bulk">
          <Card className="bg-anime-light border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-anime-primary" />
                <span>Bulk Import Trending Anime</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-300">
                  This will import the top trending anime from TMDB and mark them as trending in your database.
                  Each anime will be checked to ensure it doesn't already exist in your database.
                </p>
                
                <div className="flex justify-center mt-6">
                  <Button
                    size="lg"
                    className="bg-anime-primary hover:bg-anime-primary/90"
                    onClick={handleBulkImport}
                    disabled={isBulkImporting}
                  >
                    {isBulkImporting ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Importing Trending Anime...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Import All Trending Anime
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Custom Anime Tab */}
        <TabsContent value="custom">
          <Card className="bg-anime-light border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-anime-primary" />
                <span>Add Custom Anime</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...customAnimeForm}>
                <form onSubmit={customAnimeForm.handleSubmit(handleCustomAnimeSubmit)} className="space-y-6">
                  <FormField
                    control={customAnimeForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Anime title" {...field} className="bg-anime-dark border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={customAnimeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Anime description" 
                            {...field} 
                            className="bg-anime-dark border-gray-700 min-h-[100px]" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={customAnimeForm.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Poster Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/image.jpg" {...field} className="bg-anime-dark border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={customAnimeForm.control}
                      name="bannerImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Banner Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/banner.jpg" {...field} className="bg-anime-dark border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={customAnimeForm.control}
                      name="releaseYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Release Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="2023" 
                              {...field} 
                              className="bg-anime-dark border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={customAnimeForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-anime-dark border-gray-700">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TV Series">TV Series</SelectItem>
                              <SelectItem value="Movie">Movie</SelectItem>
                              <SelectItem value="OVA">OVA</SelectItem>
                              <SelectItem value="Special">Special</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={customAnimeForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-anime-dark border-gray-700">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Ongoing">Ongoing</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="Hiatus">Hiatus</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="bg-anime-primary hover:bg-anime-primary/90">
                    Add Custom Anime
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Add Episode Tab */}
        <TabsContent value="episode">
          <Card className="bg-anime-light border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-anime-primary" />
                <span>Add Episode with Embed</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...episodeForm}>
                <form onSubmit={episodeForm.handleSubmit(handleEpisodeSubmit)} className="space-y-6">
                  <FormField
                    control={episodeForm.control}
                    name="animeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Anime</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-anime-dark border-gray-700">
                              <SelectValue placeholder="Select anime" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {animeList.map(anime => (
                              <SelectItem key={anime.id} value={anime.id}>
                                {anime.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={episodeForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Episode title" {...field} className="bg-anime-dark border-gray-700" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={episodeForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Episode Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field} 
                              className="bg-anime-dark border-gray-700" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={episodeForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Episode description" 
                            {...field} 
                            className="bg-anime-dark border-gray-700" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={episodeForm.control}
                    name="thumbnailUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/thumbnail.jpg" 
                            {...field} 
                            className="bg-anime-dark border-gray-700" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={episodeForm.control}
                    name="embedProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Embed Provider</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-anime-dark border-gray-700">
                              <SelectValue placeholder="Select provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="filemoon">Filemoon</SelectItem>
                            <SelectItem value="streamtab">Streamtab</SelectItem>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={episodeForm.control}
                    name="embedCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Embed Code (iframe or script)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="<iframe src='...'></iframe>" 
                            {...field} 
                            className="bg-anime-dark border-gray-700 min-h-[100px] font-mono text-sm" 
                          />
                        </FormControl>
                        <FormDescription>
                          Paste the embed code provided by the video host
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="bg-anime-primary hover:bg-anime-primary/90">
                    Add Episode
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
