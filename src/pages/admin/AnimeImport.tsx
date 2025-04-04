import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Download, 
  Import, 
  Loader2, 
  Film, 
  Calendar, 
  Clock, 
  Check, 
  X,
  Info
} from "lucide-react";
import { 
  TMDBAnimeDetail, 
  TMDBSeason, 
  bulkImportAnimeWithSeasonsAndEpisodes, 
  getTMDBAnimeDetail, 
  importSpecificSeasonsForAnime, 
  searchTMDBAnime 
} from "@/services/tmdbImportService";
import {
  AniListAnime,
  AniListMedia,
  getAniListAnimeDetails,
  searchAniListAnime,
  bulkImportTrendingAniListAnime
} from "@/services/anilistService";

const AnimeImport = () => {
  const { isAdminAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState("search");
  const [activeApi, setActiveApi] = useState<"tmdb" | "anilist">("tmdb");
  const [searchQuery, setSearchQuery] = useState("");
  const [tmdbId, setTmdbId] = useState("");
  const [anilistId, setAnilistId] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBAnimeDetail[]>([]);
  const [anilistResults, setAnilistResults] = useState<AniListMedia[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<TMDBAnimeDetail | null>(null);
  const [selectedAnilistAnime, setSelectedAnilistAnime] = useState<AniListAnime | null>(null);
  const [selectedSeasons, setSelectedSeasons] = useState<Record<number, boolean>>({});
  
  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast.error("You must be logged in as an administrator");
      navigate("/admin/login");
    }
  }, [isAdminAuthenticated, navigate]);
  
  useEffect(() => {
    if (selectedAnime) {
      const initialSelectedSeasons: Record<number, boolean> = {};
      selectedAnime.seasons.forEach(season => {
        if (season.season_number > 0) { // Skip specials (season 0)
          initialSelectedSeasons[season.season_number] = true;
        }
      });
      setSelectedSeasons(initialSelectedSeasons);
    } else {
      setSelectedSeasons({});
    }
  }, [selectedAnime]);
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsSearching(true);
    try {
      if (activeApi === "tmdb") {
        const results = await searchTMDBAnime(searchQuery);
        setSearchResults(results);
        setSelectedAnime(null);
        setSelectedAnilistAnime(null);
        setAnilistResults([]);
      } else {
        const results = await searchAniListAnime(searchQuery);
        setAnilistResults(results);
        setSelectedAnilistAnime(null);
        setSelectedAnime(null);
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(`Failed to search for anime on ${activeApi.toUpperCase()}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleTmdbIdSearch = async () => {
    if (!tmdbId.trim() || isNaN(Number(tmdbId))) {
      toast.error("Please enter a valid TMDb ID");
      return;
    }
    
    setIsSearching(true);
    try {
      const result = await getTMDBAnimeDetail(Number(tmdbId));
      if (result) {
        setSearchResults([result]);
        setSelectedAnime(result);
        setSelectedAnilistAnime(null);
        setAnilistResults([]);
      } else {
        setSearchResults([]);
        toast.error("No anime found with that TMDb ID");
      }
    } catch (error) {
      console.error("TMDb ID search error:", error);
      toast.error("Failed to find anime with that ID");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAniListIdSearch = async () => {
    if (!anilistId.trim() || isNaN(Number(anilistId))) {
      toast.error("Please enter a valid AniList ID");
      return;
    }
    
    setIsSearching(true);
    try {
      const result = await getAniListAnimeDetails(Number(anilistId));
      if (result) {
        setSelectedAnilistAnime(result);
        setAnilistResults([]);
        setSelectedAnime(null);
        setSearchResults([]);
      } else {
        setAnilistResults([]);
        toast.error("No anime found with that AniList ID");
      }
    } catch (error) {
      console.error("AniList ID search error:", error);
      toast.error("Failed to find anime with that ID");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSelectAnime = (anime: TMDBAnimeDetail) => {
    setSelectedAnime(anime);
    setSelectedAnilistAnime(null);
  };
  
  const handleSelectAnilistAnime = async (anime: AniListMedia) => {
    setIsSearching(true);
    try {
      const details = await getAniListAnimeDetails(anime.id);
      if (details) {
        setSelectedAnilistAnime(details);
        setSelectedAnime(null);
      } else {
        toast.error("Failed to fetch detailed information for selected anime");
      }
    } catch (error) {
      console.error("Error fetching AniList anime details:", error);
      toast.error("Could not load anime details");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleToggleAllSeasons = (checked: boolean) => {
    if (!selectedAnime) return;
    
    const newSelectedSeasons: Record<number, boolean> = {};
    selectedAnime.seasons.forEach(season => {
      if (season.season_number > 0) { // Skip specials (season 0)
        newSelectedSeasons[season.season_number] = checked;
      }
    });
    setSelectedSeasons(newSelectedSeasons);
  };
  
  const handleToggleSeason = (seasonNumber: number, checked: boolean) => {
    setSelectedSeasons(prev => ({
      ...prev,
      [seasonNumber]: checked
    }));
  };
  
  const handleImportAll = async () => {
    if (!selectedAnime) {
      toast.error("Please select an anime first");
      return;
    }
    
    setIsImporting(true);
    try {
      const success = await bulkImportAnimeWithSeasonsAndEpisodes(selectedAnime);
      if (success) {
        toast.success(`Successfully imported "${selectedAnime.name}"`);
        navigate("/admin/anime");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import anime");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleImportSelected = async () => {
    if (!selectedAnime) {
      toast.error("Please select an anime first");
      return;
    }
    
    const seasonsToImport = Object.entries(selectedSeasons)
      .filter(([_, isSelected]) => isSelected)
      .map(([seasonNumber]) => parseInt(seasonNumber));
    
    if (seasonsToImport.length === 0) {
      toast.error("Please select at least one season to import");
      return;
    }
    
    setIsImporting(true);
    try {
      const success = await importSpecificSeasonsForAnime(selectedAnime, seasonsToImport);
      if (success) {
        toast.success(`Successfully imported selected seasons of "${selectedAnime.name}"`);
        navigate("/admin/anime");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import selected seasons");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleImportAnilist = async () => {
    if (!selectedAnilistAnime) {
      toast.error("Please select an anime first");
      return;
    }
    
    setIsImporting(true);
    try {
      const { importAniListAnimeToDatabase } = await import("@/services/anilistService");
      const success = await importAniListAnimeToDatabase(selectedAnilistAnime);
      if (success) {
        toast.success(`Successfully imported "${selectedAnilistAnime.title.english || selectedAnilistAnime.title.romaji}"`);
        navigate("/admin/anime");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import anime from AniList");
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleBulkImportAnilist = async () => {
    setIsImporting(true);
    try {
      const count = await bulkImportTrendingAniListAnime();
      if (count > 0) {
        navigate("/admin/anime");
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      toast.error("Failed to bulk import anime from AniList");
    } finally {
      setIsImporting(false);
    }
  };
  
  const getDisplayTitle = (anime: AniListMedia): string => {
    return anime.title?.english || anime.title?.romaji || 'Unknown Title';
  };
  
  const getReleaseYear = (anime: AniListMedia): string => {
    return anime.startDate?.year ? anime.startDate.year.toString() : 'Unknown';
  };

  return (
    <AdminLayout title="Anime Import">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`bg-anime-light ${isMobile ? 'w-full flex' : ''}`}>
          <TabsTrigger value="search" className={isMobile ? 'flex-1 text-xs' : ''}>
            Search & Import
          </TabsTrigger>
          <TabsTrigger value="history" className={isMobile ? 'flex-1 text-xs' : ''}>
            Import History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-6">
          <Card className="bg-anime-dark border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Search className="h-5 w-5 mr-2" /> Search for Anime
              </CardTitle>
              <CardDescription>
                Search by title or ID to find and import anime
              </CardDescription>
              <Tabs value={activeApi} onValueChange={(v) => setActiveApi(v as "tmdb" | "anilist")} className="mt-2">
                <TabsList>
                  <TabsTrigger value="tmdb">TMDB</TabsTrigger>
                  <TabsTrigger value="anilist">AniList</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Search by Title</h3>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder={`Enter anime title to search on ${activeApi === 'tmdb' ? 'TMDB' : 'AniList'}`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-anime-light text-white"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      variant="default" 
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    Search by {activeApi === 'tmdb' ? 'TMDB' : 'AniList'} ID
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeApi === 'tmdb' ? (
                      <Input 
                        placeholder="Enter TMDB ID" 
                        value={tmdbId}
                        onChange={(e) => setTmdbId(e.target.value)}
                        className="bg-anime-light text-white"
                        type="number"
                        onKeyDown={(e) => e.key === 'Enter' && handleTmdbIdSearch()}
                      />
                    ) : (
                      <Input 
                        placeholder="Enter AniList ID" 
                        value={anilistId}
                        onChange={(e) => setAnilistId(e.target.value)}
                        className="bg-anime-light text-white"
                        type="number"
                        onKeyDown={(e) => e.key === 'Enter' && handleAniListIdSearch()}
                      />
                    )}
                    <Button 
                      variant="default" 
                      onClick={activeApi === 'tmdb' ? handleTmdbIdSearch : handleAniListIdSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Find
                    </Button>
                  </div>
                </div>

                {activeApi === 'anilist' && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={handleBulkImportAnilist}
                      disabled={isImporting}
                      className="w-full"
                    >
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Bulk Import Trending Anime from AniList
                    </Button>
                  </div>
                )}
              </div>
              
              {activeApi === 'tmdb' && searchResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Search Results</h3>
                  <div className="space-y-4">
                    {searchResults.map((anime) => (
                      <Card 
                        key={anime.id} 
                        className={`bg-anime-light border-gray-700 cursor-pointer transition-all ${
                          selectedAnime?.id === anime.id ? 'ring-2 ring-anime-primary' : ''
                        }`}
                        onClick={() => handleSelectAnime(anime)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-24 overflow-hidden rounded-sm flex-shrink-0">
                              {anime.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w154${anime.poster_path}`} 
                                  alt={anime.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <Film className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                              <div>
                                <h4 className="font-medium text-white">{anime.name}</h4>
                                <p className="text-xs text-gray-400 mt-1">
                                  {anime.first_air_date ? `Released: ${new Date(anime.first_air_date).getFullYear()}` : 'Release date unknown'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  TMDB ID: {anime.id}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  Seasons: {anime.number_of_seasons}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Rating: {anime.vote_average.toFixed(1)}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeApi === 'anilist' && anilistResults.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Search Results</h3>
                  <div className="space-y-4">
                    {anilistResults.map((anime) => (
                      <Card 
                        key={anime.id} 
                        className="bg-anime-light border-gray-700 cursor-pointer transition-all"
                        onClick={() => handleSelectAnilistAnime(anime)}
                      >
                        <CardContent className="p-3">
                          <div className="flex gap-3">
                            <div className="w-16 h-24 overflow-hidden rounded-sm flex-shrink-0">
                              {anime.poster_path ? (
                                <img 
                                  src={anime.poster_path}
                                  alt={getDisplayTitle(anime)}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                  <Film className="h-8 w-8 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col justify-between flex-1">
                              <div>
                                <h4 className="font-medium text-white">{getDisplayTitle(anime)}</h4>
                                <p className="text-xs text-gray-400 mt-1">
                                  {getReleaseYear(anime) !== 'Unknown' ? `Released: ${getReleaseYear(anime)}` : 'Release date unknown'}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  AniList ID: {anime.id}
                                </Badge>
                                {anime.episodes && (
                                  <Badge variant="outline" className="text-xs">
                                    Episodes: {anime.episodes}
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                  Rating: {anime.vote_average?.toFixed(1) || 'N/A'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {selectedAnime && (
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Download className="h-5 w-5 mr-2" /> Import "{selectedAnime.name}"
                </CardTitle>
                <CardDescription>
                  Import all or selected seasons and episodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-32 h-48 overflow-hidden rounded-sm flex-shrink-0">
                      {selectedAnime.poster_path ? (
                        <img 
                          src={`https://image.tmdb.org/t/p/w300${selectedAnime.poster_path}`} 
                          alt={selectedAnime.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Film className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{selectedAnime.name}</h2>
                      {selectedAnime.original_name !== selectedAnime.name && (
                        <p className="text-sm text-gray-400 mt-1">
                          Original Title: {selectedAnime.original_name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {selectedAnime.first_air_date 
                            ? new Date(selectedAnime.first_air_date).getFullYear() 
                            : 'Unknown'}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Film className="h-3 w-3" />
                          {selectedAnime.number_of_seasons} Seasons
                        </Badge>
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Status: {selectedAnime.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mt-3 line-clamp-4">
                        {selectedAnime.overview || 'No description available.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedAnime.genres.map(genre => (
                          <Badge key={genre.id} variant="secondary" className="text-xs">
                            {genre.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Seasons to Import</h3>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleAllSeasons(true)}
                        >
                          Select All
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleAllSeasons(false)}
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-anime-light rounded-md border border-gray-700 p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedAnime.seasons
                          .filter(season => season.season_number > 0) // Filter out specials (season 0)
                          .map(season => (
                            <div 
                              key={season.id}
                              className="flex items-center space-x-2 p-2 bg-anime-dark rounded-md"
                            >
                              <Checkbox 
                                id={`season-${season.id}`}
                                checked={selectedSeasons[season.season_number] || false}
                                onCheckedChange={(checked) => 
                                  handleToggleSeason(season.season_number, checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`season-${season.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {season.name}
                                <span className="block text-xs text-gray-400 mt-1">
                                  {season.episode_count} episodes
                                </span>
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6 gap-4">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleImportAll}
                      disabled={isImporting}
                      className="bg-anime-primary hover:bg-anime-primary-darker w-48"
                    >
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Import className="h-4 w-4 mr-2" />
                      )}
                      Import All Seasons
                    </Button>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={handleImportSelected}
                      disabled={isImporting || Object.values(selectedSeasons).filter(Boolean).length === 0}
                      className="w-48"
                    >
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Import Selected
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedAnilistAnime && (
            <Card className="bg-anime-dark border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Download className="h-5 w-5 mr-2" /> Import "{selectedAnilistAnime.title.english || selectedAnilistAnime.title.romaji}"
                </CardTitle>
                <CardDescription>
                  Import anime from AniList
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-32 h-48 overflow-hidden rounded-sm flex-shrink-0">
                      {selectedAnilistAnime.coverImage.large ? (
                        <img 
                          src={selectedAnilistAnime.coverImage.large}
                          alt={selectedAnilistAnime.title.english || selectedAnilistAnime.title.romaji}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <Film className="h-12 w-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{selectedAnilistAnime.title.english || selectedAnilistAnime.title.romaji}</h2>
                      {selectedAnilistAnime.title.native && (
                        <p className="text-sm text-gray-400 mt-1">
                          Native Title: {selectedAnilistAnime.title.native}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {selectedAnilistAnime.startDate.year || 'Unknown Year'}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <Film className="h-3 w-3" />
                          {selectedAnilistAnime.episodes || '?'} Episodes
                        </Badge>
                        <Badge variant="secondary" className="text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Status: {selectedAnilistAnime.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300 mt-3 line-clamp-4">
                        {selectedAnilistAnime.description ? 
                          selectedAnilistAnime.description.replace(/<[^>]*>/g, '') : 
                          'No description available.'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedAnilistAnime.genres.map(genre => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-6">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleImportAnilist}
                      disabled={isImporting}
                      className="bg-anime-primary hover:bg-anime-primary-darker w-48"
                    >
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Import className="h-4 w-4 mr-2" />
                      )}
                      Import Anime
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-anime-dark border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" /> Import History
              </CardTitle>
              <CardDescription>
                View recently imported anime and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-gray-800">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-anime-light">
                      <TableHead className="text-gray-300">Anime</TableHead>
                      <TableHead className="text-gray-300">Seasons</TableHead>
                      <TableHead className="text-gray-300">Episodes</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Imported On</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        <div className="flex flex-col items-center">
                          <Info className="h-12 w-12 text-gray-500 mb-2" />
                          <p>Import history will be shown here</p>
                          <p className="text-sm mt-1">Start importing anime to see your history</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AnimeImport;
