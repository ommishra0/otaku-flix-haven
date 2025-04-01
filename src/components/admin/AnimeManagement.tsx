
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, Plus, RefreshCw, Download, Trash2, Edit, Film } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TMDBAnime, importAnimeToDatabase, addCustomAnime, bulkImportTrendingAnime, searchAnime, getAnimeDetails } from "@/services/tmdbService";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCategoriesForAnime, fetchAllCategories, addAnimeToCategory, removeAnimeFromCategory } from "@/services/categoryService";

const AnimeManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TMDBAnime[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState<any | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [animeCategories, setAnimeCategories] = useState<{[key: string]: any[]}>({});
  
  // Form state for custom anime
  const [customAnime, setCustomAnime] = useState({
    title: "",
    description: "",
    imageUrl: "",
    bannerImageUrl: "",
    releaseYear: new Date().getFullYear(),
    type: "TV Series",
    status: "Ongoing"
  });

  // Form state for editing anime
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    bannerImageUrl: "",
    releaseYear: 0,
    type: "",
    status: "",
    id: ""
  });

  useEffect(() => {
    fetchAnimeList();
    fetchCategoriesList();
  }, []);

  const fetchAnimeList = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('anime')
        .select('*')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      setAnimeList(data || []);

      // Fetch categories for each anime
      const animeIds = data?.map(anime => anime.id) || [];
      const categoriesMap: {[key: string]: any[]} = {};
      
      for (const animeId of animeIds) {
        const animeCategories = await getCategoriesForAnime(animeId);
        categoriesMap[animeId] = animeCategories;
      }
      
      setAnimeCategories(categoriesMap);
    } catch (error) {
      console.error('Error fetching anime list:', error);
      toast.error('Failed to load anime library');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoriesList = async () => {
    try {
      const categoriesData = await fetchAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await searchAnime(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching anime:', error);
      toast.error('Failed to search anime');
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (anime: TMDBAnime) => {
    try {
      const animeDetails = await getAnimeDetails(anime.id);
      if (!animeDetails) {
        toast.error('Failed to fetch anime details');
        return;
      }
      
      const success = await importAnimeToDatabase(animeDetails);
      if (success) {
        fetchAnimeList();
        setSearchResults(searchResults.filter(a => a.id !== anime.id));
      }
    } catch (error) {
      console.error('Error importing anime:', error);
      toast.error('Failed to import anime');
    }
  };

  const handleBulkImport = async () => {
    setIsBulkImporting(true);
    try {
      const count = await bulkImportTrendingAnime();
      if (count > 0) {
        fetchAnimeList();
      }
    } catch (error) {
      console.error('Error bulk importing anime:', error);
      toast.error('Failed to bulk import anime');
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleDeleteAnime = async (animeId: string) => {
    if (!window.confirm('Are you sure you want to delete this anime? This will also delete all associated episodes.')) {
      return;
    }
    
    try {
      // First delete episodes associated with this anime
      const { error: episodesError } = await supabase
        .from('episodes')
        .delete()
        .eq('anime_id', animeId);
      
      if (episodesError) throw episodesError;
      
      // Then delete the anime
      const { error: animeError } = await supabase
        .from('anime')
        .delete()
        .eq('id', animeId);
      
      if (animeError) throw animeError;
      
      toast.success('Anime deleted successfully');
      fetchAnimeList();
    } catch (error) {
      console.error('Error deleting anime:', error);
      toast.error('Failed to delete anime');
    }
  };

  const handleAddCustomAnime = async () => {
    try {
      if (!customAnime.title) {
        toast.error('Title is required');
        return;
      }

      const animeId = await addCustomAnime({
        title: customAnime.title,
        description: customAnime.description,
        imageUrl: customAnime.imageUrl,
        bannerImageUrl: customAnime.bannerImageUrl,
        releaseYear: Number(customAnime.releaseYear),
        type: customAnime.type,
        status: customAnime.status
      });
      
      if (animeId) {
        // Add anime to selected categories
        for (const categoryId of selectedCategories) {
          await addAnimeToCategory(animeId, categoryId);
        }
        
        fetchAnimeList();
        setShowAddDialog(false);
        setCustomAnime({
          title: "",
          description: "",
          imageUrl: "",
          bannerImageUrl: "",
          releaseYear: new Date().getFullYear(),
          type: "TV Series",
          status: "Ongoing"
        });
        setSelectedCategories([]);
      }
    } catch (error) {
      console.error('Error adding custom anime:', error);
      toast.error('Failed to add custom anime');
    }
  };

  const handleEditAnime = (anime: any) => {
    setEditFormData({
      title: anime.title,
      description: anime.description || "",
      imageUrl: anime.image_url || "",
      bannerImageUrl: anime.banner_image_url || "",
      releaseYear: anime.release_year || new Date().getFullYear(),
      type: anime.type || "TV Series",
      status: anime.status || "Ongoing",
      id: anime.id
    });
    
    setSelectedAnime(anime);
    
    // Set selected categories
    const currentCategories = animeCategories[anime.id] || [];
    setSelectedCategories(currentCategories.map(cat => cat.id));
    
    setShowEditDialog(true);
  };

  const handleUpdateAnime = async () => {
    try {
      if (!editFormData.title) {
        toast.error('Title is required');
        return;
      }

      const { error } = await supabase
        .from('anime')
        .update({
          title: editFormData.title,
          description: editFormData.description,
          image_url: editFormData.imageUrl,
          banner_image_url: editFormData.bannerImageUrl,
          release_year: Number(editFormData.releaseYear),
          type: editFormData.type,
          status: editFormData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', editFormData.id);
      
      if (error) throw error;
      
      // Update anime categories
      // First, get current categories
      const currentCategories = animeCategories[editFormData.id] || [];
      const currentCategoryIds = currentCategories.map(cat => cat.id);
      
      // Categories to add (in selectedCategories but not in currentCategoryIds)
      const categoriesToAdd = selectedCategories.filter(id => !currentCategoryIds.includes(id));
      
      // Categories to remove (in currentCategoryIds but not in selectedCategories)
      const categoriesToRemove = currentCategoryIds.filter(id => !selectedCategories.includes(id));
      
      // Add new categories
      for (const categoryId of categoriesToAdd) {
        await addAnimeToCategory(editFormData.id, categoryId);
      }
      
      // Remove old categories
      for (const categoryId of categoriesToRemove) {
        await removeAnimeFromCategory(editFormData.id, categoryId);
      }
      
      toast.success('Anime updated successfully');
      fetchAnimeList();
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating anime:', error);
      toast.error('Failed to update anime');
    }
  };

  const handleAddCategoryChange = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <Card className="bg-anime-dark border-gray-800">
      <CardHeader>
        <CardTitle>Anime Library</CardTitle>
        <CardDescription>
          Manage your anime collection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="library" className="space-y-4">
          <TabsList className="bg-anime-light">
            <TabsTrigger value="library">Anime Library</TabsTrigger>
            <TabsTrigger value="import">Import from TMDB</TabsTrigger>
            <TabsTrigger value="custom">Add Custom Anime</TabsTrigger>
          </TabsList>
          
          <TabsContent value="library" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Your Anime Collection</h3>
              <Button 
                variant="outline" 
                onClick={fetchAnimeList}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-anime-primary"></div>
              </div>
            ) : animeList.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Film size={48} className="mx-auto mb-4 opacity-30" />
                <p>Your anime library is empty.</p>
                <p className="text-sm">Import anime from TMDB or add custom anime to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animeList.map(anime => (
                  <Card key={anime.id} className="bg-anime-light border-gray-700 overflow-hidden flex flex-col">
                    <div className="relative h-40 bg-gray-800">
                      {anime.image_url ? (
                        <img 
                          src={anime.image_url} 
                          alt={anime.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <Film size={48} />
                        </div>
                      )}
                    </div>
                    <CardContent className="py-4 flex-grow">
                      <h4 className="font-semibold text-lg mb-1 line-clamp-1">{anime.title}</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {anime.type || 'Unknown'} • {anime.release_year || 'Unknown'} • {anime.status || 'Unknown'}
                      </p>
                      <p className="text-sm line-clamp-3 mb-3 text-gray-300">
                        {anime.description || 'No description available.'}
                      </p>
                      
                      {/* Categories */}
                      {animeCategories[anime.id]?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 mb-1">Categories:</p>
                          <div className="flex flex-wrap gap-1">
                            {animeCategories[anime.id].map(category => (
                              <span 
                                key={category.id}
                                className="bg-anime-primary/20 text-anime-primary px-2 py-0.5 rounded-full text-xs"
                              >
                                {category.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditAnime(anime)}
                          className="flex items-center gap-1"
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteAnime(anime.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="import" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import Anime from TMDB</h3>
              <Button 
                variant="outline" 
                onClick={handleBulkImport}
                disabled={isBulkImporting}
                className="flex items-center gap-2"
              >
                {isBulkImporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-anime-primary"></div>
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Bulk Import Trending</span>
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex gap-2 mb-6">
              <Input
                type="text"
                placeholder="Search for anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-anime-light border-gray-700"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="flex items-center gap-2"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <SearchIcon size={16} />
                )}
                <span>Search</span>
              </Button>
            </div>
            
            {isSearching ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-anime-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(anime => (
                  <Card key={anime.id} className="bg-anime-light border-gray-700 overflow-hidden flex flex-col">
                    <div className="relative h-40 bg-gray-800">
                      {anime.poster_path ? (
                        <img 
                          src={anime.poster_path} 
                          alt={anime.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <Film size={48} />
                        </div>
                      )}
                    </div>
                    <CardContent className="py-4 flex-grow">
                      <h4 className="font-semibold text-lg mb-1 line-clamp-1">{anime.title}</h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {anime.release_date ? new Date(anime.release_date).getFullYear() : 'Unknown'} • Rating: {anime.vote_average.toFixed(1)}
                      </p>
                      <p className="text-sm line-clamp-3 mb-3 text-gray-300">
                        {anime.overview || 'No description available.'}
                      </p>
                      <div className="mt-auto">
                        <Button 
                          onClick={() => handleImport(anime)}
                          className="w-full"
                        >
                          Import to Library
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-gray-400">
                <p>No results found for "{searchQuery}".</p>
                <p className="text-sm">Try a different search term or add as a custom anime.</p>
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Custom Anime</h3>
              <Button 
                variant="default"
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Add Custom Anime</span>
              </Button>
            </div>
            
            <div className="text-center py-8 text-gray-400">
              <p>Use this tab to add anime that aren't available on TMDB.</p>
              <p className="text-sm">Click the button above to get started.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Add Custom Anime Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Custom Anime</DialogTitle>
            <DialogDescription>
              Enter the details for your custom anime entry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                value={customAnime.title}
                onChange={(e) => setCustomAnime({...customAnime, title: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="Enter anime title"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={customAnime.description}
                onChange={(e) => setCustomAnime({...customAnime, description: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-24"
                placeholder="Enter anime description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="releaseYear">Release Year</Label>
                <Input
                  id="releaseYear"
                  type="number"
                  value={customAnime.releaseYear}
                  onChange={(e) => setCustomAnime({...customAnime, releaseYear: parseInt(e.target.value)})}
                  className="bg-anime-light border-gray-700 mt-1"
                  placeholder="2023"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select 
                  value={customAnime.type} 
                  onValueChange={(value) => setCustomAnime({...customAnime, type: value})}
                >
                  <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-anime-dark border-gray-700">
                    <SelectItem value="TV Series">TV Series</SelectItem>
                    <SelectItem value="Movie">Movie</SelectItem>
                    <SelectItem value="OVA">OVA</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={customAnime.status} 
                onValueChange={(value) => setCustomAnime({...customAnime, status: value})}
              >
                <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-anime-dark border-gray-700">
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">Poster Image URL</Label>
              <Input
                id="imageUrl"
                value={customAnime.imageUrl}
                onChange={(e) => setCustomAnime({...customAnime, imageUrl: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="bannerImageUrl">Banner Image URL</Label>
              <Input
                id="bannerImageUrl"
                value={customAnime.bannerImageUrl}
                onChange={(e) => setCustomAnime({...customAnime, bannerImageUrl: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleAddCategoryChange(category.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-anime-primary text-white'
                          : 'bg-anime-light text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No categories available.</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomAnime}>
              Add Anime
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Anime Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Anime</DialogTitle>
            <DialogDescription>
              Update the details for your anime entry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="edit-title"
                value={editFormData.title}
                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="Enter anime title"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-24"
                placeholder="Enter anime description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-releaseYear">Release Year</Label>
                <Input
                  id="edit-releaseYear"
                  type="number"
                  value={editFormData.releaseYear}
                  onChange={(e) => setEditFormData({...editFormData, releaseYear: parseInt(e.target.value)})}
                  className="bg-anime-light border-gray-700 mt-1"
                  placeholder="2023"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select 
                  value={editFormData.type} 
                  onValueChange={(value) => setEditFormData({...editFormData, type: value})}
                >
                  <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-anime-dark border-gray-700">
                    <SelectItem value="TV Series">TV Series</SelectItem>
                    <SelectItem value="Movie">Movie</SelectItem>
                    <SelectItem value="OVA">OVA</SelectItem>
                    <SelectItem value="Special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editFormData.status} 
                onValueChange={(value) => setEditFormData({...editFormData, status: value})}
              >
                <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-anime-dark border-gray-700">
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-imageUrl">Poster Image URL</Label>
              <Input
                id="edit-imageUrl"
                value={editFormData.imageUrl}
                onChange={(e) => setEditFormData({...editFormData, imageUrl: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-bannerImageUrl">Banner Image URL</Label>
              <Input
                id="edit-bannerImageUrl"
                value={editFormData.bannerImageUrl}
                onChange={(e) => setEditFormData({...editFormData, bannerImageUrl: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/banner.jpg"
              />
            </div>
            
            <div>
              <Label className="mb-2 block">Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.length > 0 ? (
                  categories.map(category => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleAddCategoryChange(category.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategories.includes(category.id)
                          ? 'bg-anime-primary text-white'
                          : 'bg-anime-light text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No categories available.</p>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAnime}>
              Update Anime
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AnimeManagement;
