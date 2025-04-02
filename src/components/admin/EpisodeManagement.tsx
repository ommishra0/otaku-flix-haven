import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Video, PlayCircle, UploadCloud, Subtitles, Film } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const EpisodeManagement = () => {
  const { isAdminAuthenticated, adminUser } = useAdminAuth();
  const isMobile = useIsMobile();
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [episodeList, setEpisodeList] = useState<any[]>([]);
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);
  const [selectedAnimeName, setSelectedAnimeName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any | null>(null);
  
  const [addFormData, setAddFormData] = useState({
    title: "",
    number: 1,
    description: "",
    thumbnailUrl: "",
    embedProvider: "filemoon",
    embedCode: "",
    airDate: "",
    subtitles: [] as Array<{ language: string; label: string; url: string }>,
    qualityOptions: [] as Array<{ quality: string; label: string; url: string }>
  });
  
  const [editFormData, setEditFormData] = useState({
    id: "",
    title: "",
    number: 1,
    description: "",
    thumbnailUrl: "",
    embedProvider: "",
    embedCode: "",
  });

  const [showSubtitleDialog, setShowSubtitleDialog] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState({ language: "", label: "", url: "" });
  const [currentQuality, setCurrentQuality] = useState({ quality: "", label: "", url: "" });

  useEffect(() => {
    fetchAnimeList();
  }, []);

  useEffect(() => {
    if (selectedAnimeId) {
      fetchEpisodes(selectedAnimeId);
    }
  }, [selectedAnimeId]);

  const fetchAnimeList = async () => {
    try {
      const { data, error } = await supabase
        .from('anime')
        .select('id, title')
        .order('title', { ascending: true });
      
      if (error) throw error;
      
      setAnimeList(data || []);
    } catch (error) {
      console.error('Error fetching anime list:', error);
      toast.error('Failed to load anime list');
    }
  };

  const fetchEpisodes = async (animeId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('anime_id', animeId)
        .order('number', { ascending: true });
      
      if (error) throw error;
      
      setEpisodeList(data || []);
      
      const anime = animeList.find(a => a.id === animeId);
      if (anime) {
        setSelectedAnimeName(anime.title);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
      toast.error('Failed to load episodes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEpisode = () => {
    if (!selectedAnimeId) {
      toast.error('Please select an anime first');
      return;
    }
    
    if (!isAdminAuthenticated || !adminUser) {
      toast.error('You must be logged in as an administrator to add episodes');
      return;
    }
    
    const nextEpisodeNumber = episodeList.length > 0 
      ? Math.max(...episodeList.map(ep => ep.number)) + 1 
      : 1;
    
    setAddFormData({
      ...addFormData,
      number: nextEpisodeNumber,
    });
    
    setShowAddDialog(true);
  };

  const handleEditEpisode = (episode: any) => {
    setSelectedEpisode(episode);
    setEditFormData({
      id: episode.id,
      title: episode.title,
      number: episode.number,
      description: episode.description || "",
      thumbnailUrl: episode.thumbnail_url || "",
      embedProvider: episode.embed_provider || "filemoon",
      embedCode: episode.embed_code || "",
    });
    setShowEditDialog(true);
  };

  const handleDeleteEpisode = async (episodeId: string) => {
    if (!window.confirm('Are you sure you want to delete this episode?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('episodes')
        .delete()
        .eq('id', episodeId);
      
      if (error) throw error;
      
      toast.success('Episode deleted successfully');
      
      if (selectedAnimeId) {
        fetchEpisodes(selectedAnimeId);
      }
    } catch (error) {
      console.error('Error deleting episode:', error);
      toast.error('Failed to delete episode');
    }
  };

  const addSubtitle = () => {
    if (!currentSubtitle.language || !currentSubtitle.label || !currentSubtitle.url) {
      toast.error("All subtitle fields are required");
      return;
    }
    
    setAddFormData({
      ...addFormData,
      subtitles: [...addFormData.subtitles, { ...currentSubtitle }]
    });
    
    setCurrentSubtitle({ language: "", label: "", url: "" });
    setShowSubtitleDialog(false);
  };

  const addQualityOption = () => {
    if (!currentQuality.quality || !currentQuality.label || !currentQuality.url) {
      toast.error("All quality option fields are required");
      return;
    }
    
    setAddFormData({
      ...addFormData,
      qualityOptions: [...addFormData.qualityOptions, { ...currentQuality }]
    });
    
    setCurrentQuality({ quality: "", label: "", url: "" });
    setShowQualityDialog(false);
  };

  const removeSubtitle = (index: number) => {
    const newSubtitles = [...addFormData.subtitles];
    newSubtitles.splice(index, 1);
    setAddFormData({ ...addFormData, subtitles: newSubtitles });
  };

  const removeQualityOption = (index: number) => {
    const newOptions = [...addFormData.qualityOptions];
    newOptions.splice(index, 1);
    setAddFormData({ ...addFormData, qualityOptions: newOptions });
  };

  const submitAddEpisode = async () => {
    if (!selectedAnimeId) {
      toast.error('No anime selected');
      return;
    }
    
    if (!addFormData.title) {
      toast.error('Episode title is required');
      return;
    }
    
    if (!isAdminAuthenticated || !adminUser) {
      toast.error('You must be logged in as an administrator to add episodes');
      return;
    }
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast.error('You must be logged in to add episodes');
        return;
      }
      
      const { data, error } = await supabase
        .from('episodes')
        .insert({
          anime_id: selectedAnimeId,
          title: addFormData.title,
          number: addFormData.number,
          description: addFormData.description,
          thumbnail_url: addFormData.thumbnailUrl,
          embed_provider: addFormData.embedProvider,
          embed_code: addFormData.embedCode,
          air_date: addFormData.airDate ? new Date(addFormData.airDate).toISOString() : null,
          subtitles: addFormData.subtitles.length > 0 ? addFormData.subtitles : null,
          quality_options: addFormData.qualityOptions.length > 0 ? addFormData.qualityOptions : null
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding episode:', error);
        throw error;
      }
      
      toast.success('Episode added successfully');
      setShowAddDialog(false);
      setAddFormData({
        title: "",
        number: addFormData.number + 1,
        description: "",
        thumbnailUrl: "",
        embedProvider: "filemoon",
        embedCode: "",
        airDate: "",
        subtitles: [],
        qualityOptions: []
      });
      
      fetchEpisodes(selectedAnimeId);
    } catch (error: any) {
      console.error('Error adding episode:', error);
      toast.error(`Could not add episode to database: ${error.message}`);
    }
  };

  const submitEditEpisode = async () => {
    if (!editFormData.title) {
      toast.error('Episode title is required');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          title: editFormData.title,
          number: editFormData.number,
          description: editFormData.description,
          thumbnail_url: editFormData.thumbnailUrl,
          embed_provider: editFormData.embedProvider,
          embed_code: editFormData.embedCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editFormData.id);
      
      if (error) throw error;
      
      toast.success('Episode updated successfully');
      setShowEditDialog(false);
      
      if (selectedAnimeId) {
        fetchEpisodes(selectedAnimeId);
      }
    } catch (error) {
      console.error('Error updating episode:', error);
      toast.error('Failed to update episode');
    }
  };

  return (
    <Card className="bg-anime-dark border-gray-800">
      <CardHeader>
        <CardTitle>Episode Management</CardTitle>
        <CardDescription>
          Manage episodes for your anime series
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label htmlFor="anime-select" className="mb-2 block">Select Anime</Label>
          <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2`}>
            <Select onValueChange={(value) => setSelectedAnimeId(value)} className={isMobile ? 'w-full mb-2' : 'w-72'}>
              <SelectTrigger className="bg-anime-light border-gray-700">
                <SelectValue placeholder="Select an anime" />
              </SelectTrigger>
              <SelectContent className="bg-anime-dark border-gray-700">
                {animeList.map(anime => (
                  <SelectItem key={anime.id} value={anime.id}>
                    {anime.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleAddEpisode} 
              disabled={!selectedAnimeId}
              className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
            >
              <Plus size={16} />
              <span>Add Episode</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        ) : selectedAnimeId ? (
          episodeList.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Episodes for {selectedAnimeName}</h3>
              <div className="grid gap-4">
                {episodeList.map(episode => (
                  <Card key={episode.id} className="bg-anime-light border-gray-700">
                    <CardContent className={`p-4 ${isMobile ? '' : ''}`}>
                      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex items-center justify-between'}`}>
                        <div className={`${isMobile ? '' : 'flex items-center gap-4'}`}>
                          <div className={`${isMobile ? 'mb-2 flex items-center gap-3' : 'flex-shrink-0'} w-12 h-12 rounded-md bg-gray-800 flex items-center justify-center`}>
                            {episode.thumbnail_url ? (
                              <img 
                                src={episode.thumbnail_url} 
                                alt={episode.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <PlayCircle size={24} className="text-gray-500" />
                            )}
                            {isMobile && (
                              <div className="ml-3">
                                <h4 className="font-semibold">Episode {episode.number}: {episode.title}</h4>
                                {episode.description && (
                                  <p className="text-sm text-gray-400 line-clamp-1">{episode.description}</p>
                                )}
                              </div>
                            )}
                          </div>
                          {!isMobile && (
                            <div>
                              <h4 className="font-semibold">Episode {episode.number}: {episode.title}</h4>
                              {episode.description && (
                                <p className="text-sm text-gray-400 line-clamp-1">{episode.description}</p>
                              )}
                            </div>
                          )}
                        </div>
                        <div className={`flex ${isMobile ? 'justify-end' : ''} gap-2`}>
                          <Button 
                            variant="outline" 
                            size={isMobile ? "sm" : "sm"}
                            onClick={() => handleEditEpisode(episode)}
                            className="flex items-center gap-1"
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </Button>
                          <Button 
                            variant="destructive" 
                            size={isMobile ? "sm" : "sm"}
                            onClick={() => handleDeleteEpisode(episode.id)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Video size={48} className="mx-auto mb-4 opacity-30" />
              <p>No episodes found for {selectedAnimeName}.</p>
              <p className="text-sm">Click "Add Episode" to create your first episode.</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Please select an anime to manage its episodes.</p>
          </div>
        )}
      </CardContent>
      
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white max-w-4xl">
          <DialogHeader>
            <DialogTitle>Add New Episode</DialogTitle>
            <DialogDescription>
              Adding episode for: {selectedAnimeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="episode-title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="episode-title"
                  value={addFormData.title}
                  onChange={(e) => setAddFormData({...addFormData, title: e.target.value})}
                  className="bg-anime-light border-gray-700 mt-1"
                  placeholder="Episode title"
                />
              </div>
              
              <div>
                <Label htmlFor="episode-number">Episode Number</Label>
                <Input
                  id="episode-number"
                  type="number"
                  value={addFormData.number}
                  onChange={(e) => setAddFormData({...addFormData, number: parseInt(e.target.value)})}
                  className="bg-anime-light border-gray-700 mt-1"
                  min={1}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="episode-description">Description</Label>
              <Textarea
                id="episode-description"
                value={addFormData.description}
                onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-20"
                placeholder="Episode description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="episode-thumbnail">Thumbnail URL</Label>
                <Input
                  id="episode-thumbnail"
                  value={addFormData.thumbnailUrl}
                  onChange={(e) => setAddFormData({...addFormData, thumbnailUrl: e.target.value})}
                  className="bg-anime-light border-gray-700 mt-1"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
              
              <div>
                <Label htmlFor="episode-air-date">Air Date</Label>
                <Input
                  id="episode-air-date"
                  type="date"
                  value={addFormData.airDate}
                  onChange={(e) => setAddFormData({...addFormData, airDate: e.target.value})}
                  className="bg-anime-light border-gray-700 mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="episode-provider">Embed Provider</Label>
              <Select 
                value={addFormData.embedProvider} 
                onValueChange={(value) => setAddFormData({...addFormData, embedProvider: value})}
              >
                <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-anime-dark border-gray-700">
                  <SelectItem value="filemoon">Filemoon</SelectItem>
                  <SelectItem value="streamtape">Streamtape</SelectItem>
                  <SelectItem value="doodstream">DoodStream</SelectItem>
                  <SelectItem value="vidplay">VidPlay</SelectItem>
                  <SelectItem value="mp4upload">MP4Upload</SelectItem>
                  <SelectItem value="direct">Direct URL</SelectItem>
                  <SelectItem value="custom">Custom Embed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="episode-embed">Embed Code / URL</Label>
              <Textarea
                id="episode-embed"
                value={addFormData.embedCode}
                onChange={(e) => setAddFormData({...addFormData, embedCode: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-32 font-mono text-sm"
                placeholder={addFormData.embedProvider === 'direct' 
                  ? 'https://example.com/video.mp4' 
                  : '<iframe src="https://example.com/embed/..." allowfullscreen></iframe>'}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Subtitles</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowSubtitleDialog(true)}
                  className="flex items-center gap-1"
                >
                  <Subtitles size={14} />
                  <span>Add Subtitle</span>
                </Button>
              </div>
              
              {addFormData.subtitles.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {addFormData.subtitles.map((subtitle, index) => (
                    <div key={index} className="flex items-center justify-between bg-anime-light rounded p-2">
                      <div>
                        <span className="font-medium">{subtitle.label}</span>
                        <span className="text-gray-400 text-sm ml-2">({subtitle.language})</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeSubtitle(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No subtitles added</div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Quality Options</Label>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setShowQualityDialog(true)}
                  className="flex items-center gap-1"
                >
                  <Film size={14} />
                  <span>Add Quality</span>
                </Button>
              </div>
              
              {addFormData.qualityOptions.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {addFormData.qualityOptions.map((quality, index) => (
                    <div key={index} className="flex items-center justify-between bg-anime-light rounded p-2">
                      <div>
                        <span className="font-medium">{quality.label}</span>
                        <span className="text-gray-400 text-sm ml-2">({quality.quality})</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeQualityOption(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No quality options added</div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitAddEpisode}
              className="flex items-center gap-2"
            >
              <UploadCloud size={16} />
              <span>Add Episode</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSubtitleDialog} onOpenChange={setShowSubtitleDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Subtitle</DialogTitle>
            <DialogDescription>
              Add a subtitle track for this episode
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="subtitle-language">Language Code</Label>
              <Input
                id="subtitle-language"
                value={currentSubtitle.language}
                onChange={(e) => setCurrentSubtitle({...currentSubtitle, language: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="en, es, fr, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle-label">Display Name</Label>
              <Input
                id="subtitle-label"
                value={currentSubtitle.label}
                onChange={(e) => setCurrentSubtitle({...currentSubtitle, label: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="English, Spanish, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle-url">Subtitle URL (.vtt format)</Label>
              <Input
                id="subtitle-url"
                value={currentSubtitle.url}
                onChange={(e) => setCurrentSubtitle({...currentSubtitle, url: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/subtitles.vtt"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubtitleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addSubtitle}>
              Add Subtitle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add Quality Option</DialogTitle>
            <DialogDescription>
              Add a video quality option for this episode
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="quality-resolution">Resolution</Label>
              <Select 
                value={currentQuality.quality} 
                onValueChange={(value) => setCurrentQuality({...currentQuality, quality: value})}
              >
                <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent className="bg-anime-dark border-gray-700">
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p</SelectItem>
                  <SelectItem value="1440p">1440p</SelectItem>
                  <SelectItem value="4K">4K</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quality-label">Display Label</Label>
              <Input
                id="quality-label"
                value={currentQuality.label}
                onChange={(e) => setCurrentQuality({...currentQuality, label: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="480p SD, 1080p HD, etc."
              />
            </div>
            
            <div>
              <Label htmlFor="quality-url">Video URL</Label>
              <Input
                id="quality-url"
                value={currentQuality.url}
                onChange={(e) => setCurrentQuality({...currentQuality, url: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/video-480p.mp4"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQualityDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addQualityOption}>
              Add Quality Option
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-anime-dark border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Edit Episode</DialogTitle>
            <DialogDescription>
              Edit episode details for: {selectedAnimeName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-episode-title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-episode-title"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                  className="bg-anime-light border-gray-700 mt-1"
                  placeholder="Episode title"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-episode-number">Episode Number</Label>
                <Input
                  id="edit-episode-number"
                  type="number"
                  value={editFormData.number}
                  onChange={(e) => setEditFormData({...editFormData, number: parseInt(e.target.value)})}
                  className="bg-anime-light border-gray-700 mt-1"
                  min={1}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="edit-episode-description">Description</Label>
              <Textarea
                id="edit-episode-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-20"
                placeholder="Episode description"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-episode-thumbnail">Thumbnail URL</Label>
              <Input
                id="edit-episode-thumbnail"
                value={editFormData.thumbnailUrl}
                onChange={(e) => setEditFormData({...editFormData, thumbnailUrl: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-episode-provider">Embed Provider</Label>
              <Select 
                value={editFormData.embedProvider} 
                onValueChange={(value) => setEditFormData({...editFormData, embedProvider: value})}
              >
                <SelectTrigger className="bg-anime-light border-gray-700 mt-1">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent className="bg-anime-dark border-gray-700">
                  <SelectItem value="filemoon">Filemoon</SelectItem>
                  <SelectItem value="streamtape">Streamtape</SelectItem>
                  <SelectItem value="doodstream">DoodStream</SelectItem>
                  <SelectItem value="vidplay">VidPlay</SelectItem>
                  <SelectItem value="mp4upload">MP4Upload</SelectItem>
                  <SelectItem value="direct">Direct URL</SelectItem>
                  <SelectItem value="custom">Custom Embed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="edit-episode-embed">Embed Code / URL</Label>
              <Textarea
                id="edit-episode-embed"
                value={editFormData.embedCode}
                onChange={(e) => setEditFormData({...editFormData, embedCode: e.target.value})}
                className="bg-anime-light border-gray-700 mt-1 h-32 font-mono text-sm"
                placeholder={editFormData.embedProvider === 'direct' 
                  ? 'https://example.com/video.mp4' 
                  : '<iframe src="https://example.com/embed/..." allowfullscreen></iframe>'}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={submitEditEpisode}>
              Update Episode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default EpisodeManagement;
