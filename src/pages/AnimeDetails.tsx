
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Star, CalendarDays, Clock, Heart, Share, Users, Info } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import AnimeSection from "@/components/home/AnimeSection";
import AdBanner from "@/components/shared/AdBanner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  fetchAnimeById, 
  fetchEpisodes, 
  fetchAnimeCast, 
  fetchAnimeTrailers,
  fetchAnimeRatings,
  fetchAnimeEpisodes,
  Anime, 
  Episode, 
  CastMember, 
  Trailer, 
  Rating 
} from "@/services/animeService";
import TrailerSection from "@/components/anime/TrailerSection";
import RatingDisplay from "@/components/anime/RatingDisplay";
import { useInView } from "react-intersection-observer";
import { animeToCardProps } from "@/components/home/AnimeCard";

const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // For pagination/infinite scroll
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Intersection observer for infinite scrolling
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });
  
  // Load anime data
  useEffect(() => {
    const loadAnimeData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch anime details
        const animeData = await fetchAnimeById(id);
        if (animeData) {
          setAnime(animeData);
        }
        
        // Fetch episodes (first page)
        const episodesData = await fetchAnimeEpisodes(id, 1);
        setEpisodes(episodesData.episodes);
        setTotalPages(episodesData.totalPages);
        
        // Fetch cast info
        const castData = await fetchAnimeCast(id);
        setCast(castData);
        
        // Fetch trailers
        const trailerData = await fetchAnimeTrailers(id);
        setTrailers(trailerData);
        
        // Fetch ratings
        const ratingData = await fetchAnimeRatings(id);
        setRatings(ratingData);
        
        // Fetch recommended anime (implement this based on your recommendations system)
        // For now, we'll leave it empty
        setRecommendations([]);
        
      } catch (error) {
        console.error("Error loading anime data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnimeData();
  }, [id]);
  
  // Handle infinite scroll
  useEffect(() => {
    if (inView && page < totalPages && !isLoadingMore) {
      loadMoreEpisodes();
    }
  }, [inView, page, totalPages]);
  
  const loadMoreEpisodes = async () => {
    if (!id || isLoadingMore) return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const episodesData = await fetchAnimeEpisodes(id, nextPage);
      
      // Append new episodes to existing ones
      setEpisodes(prev => [...prev, ...episodesData.episodes]);
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more episodes:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  if (!anime) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
          <p className="text-gray-400 mb-6">The anime you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button variant="default">Return to Home</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      {/* Banner */}
      <div className="relative h-[400px] md:h-[500px] -mx-4 mb-8">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${anime.banner_image_url || anime.image_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-anime-dark via-anime-dark/60 to-transparent" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Anime Poster and Info */}
        <div className="md:col-span-1">
          <div className="relative">
            <img 
              src={anime.image_url || '/placeholder.svg'} 
              alt={anime.title} 
              className="w-full rounded-md shadow-lg"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-anime-primary text-white text-sm px-3 py-1 rounded-md font-medium">
              {anime.type || 'TV'}
            </div>
          </div>
          
          <div className="mt-6 space-y-4">
            <Button className="anime-btn-primary w-full flex items-center justify-center gap-2 py-6">
              <Play size={18} />
              <span>Watch Now</span>
            </Button>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
                <Heart size={18} />
                <span>Add to List</span>
              </Button>
              <Button variant="outline" className="w-12 h-12 flex items-center justify-center">
                <Share size={18} />
              </Button>
            </div>
          </div>
          
          {/* Ratings display */}
          <div className="mt-6">
            <RatingDisplay ratings={ratings} className="mb-4" />
          </div>
          
          {/* Anime Details */}
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star size={18} fill="currentColor" />
              <span className="font-semibold">{anime.rating || "N/A"}</span>
              <span className="text-gray-400 text-sm">/ 5.0</span>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span>{anime.type || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span>{anime.status || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Studio:</span>
                <span>{anime.studio || "Unknown"}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400">Released:</span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  {anime.release_year || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Episodes:</span>
                <span>{episodes.length || 0}</span>
              </div>
            </div>
            
            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {anime.genres?.map((genre, index) => (
                  <Link 
                    key={index} 
                    to={`/genres/${genre.toLowerCase()}`}
                    className="px-3 py-1 bg-anime-light rounded-full text-sm hover:bg-anime-primary transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Cast & Crew Link */}
            {cast.length > 0 && (
              <div className="pt-4">
                <Link to={`/anime/${id}/cast`} className="flex items-center gap-2 text-anime-primary hover:underline">
                  <Users size={16} />
                  <span>View Full Cast & Crew</span>
                </Link>
              </div>
            )}
          </div>
          
          <AdBanner position="sidebar" className="mt-8 h-[400px]" />
        </div>
        
        {/* Anime Description and Episodes */}
        <div className="md:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>
          
          {anime.alternative_titles?.length > 0 && (
            <div className="text-gray-400 mb-4">
              {anime.alternative_titles.join(" • ")}
            </div>
          )}
          
          {/* Trailer Section */}
          {trailers.length > 0 && (
            <TrailerSection trailers={trailers} className="mb-8" />
          )}
          
          <Tabs defaultValue="episodes" className="w-full mt-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="episodes">Episodes</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="related">Related</TabsTrigger>
            </TabsList>
            
            <TabsContent value="episodes" className="pt-4">
              <div className="space-y-4">
                {episodes.map((episode) => (
                  <Link 
                    key={episode.id}
                    to={`/watch/${anime.id}/${episode.id}`}
                    className="block bg-anime-light rounded-md overflow-hidden transition-transform hover:scale-[1.01]"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-[180px] h-[100px]">
                        <img 
                          src={episode.thumbnail_url || "/placeholder.svg"} 
                          alt={episode.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <Play size={30} className="text-white" />
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm flex items-center">
                          <Clock size={12} className="mr-1" />
                          {episode.duration || "?"}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-anime-primary text-white text-xs px-2 py-1 rounded-sm">
                            EP {episode.number}
                          </span>
                          <h3 className="font-semibold">{episode.title}</h3>
                          {episode.air_date && (
                            <span className="text-xs text-gray-400 ml-auto">
                              {new Date(episode.air_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                          {episode.description || "No description available."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {/* Loading more indicator */}
                {page < totalPages && (
                  <div 
                    ref={loadMoreRef}
                    className="py-6 flex justify-center"
                  >
                    {isLoadingMore ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-anime-primary"></div>
                    ) : (
                      <Button onClick={loadMoreEpisodes}>Load More Episodes</Button>
                    )}
                  </div>
                )}
                
                {episodes.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No episodes available for this anime yet.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Synopsis</h3>
                  <p className="text-gray-300 leading-relaxed">{anime.description || "No synopsis available."}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-3">Characters</h3>
                  {cast.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {cast.slice(0, 6).map((member) => (
                        <div key={member.id} className="flex gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img 
                              src={member.image_url || "/placeholder.svg"} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-400">{member.character_name}</p>
                          </div>
                        </div>
                      ))}
                      
                      {cast.length > 6 && (
                        <Link 
                          to={`/anime/${id}/cast`}
                          className="col-span-2 text-center mt-4 text-anime-primary hover:underline"
                        >
                          View All Cast & Crew
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">No character information available.</p>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="related">
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <Link 
                      key={rec.id}
                      to={`/anime/${rec.id}`}
                      className="anime-card group"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img 
                          src={rec.image_url || "/placeholder.svg"} 
                          alt={rec.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <div className="flex items-center mt-1">
                            <span className="text-yellow-400 text-sm">★ {rec.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="anime-title">{rec.title}</h3>
                        <p className="text-sm text-gray-400">{rec.release_year}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No related anime available.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <AdBanner position="bottom" className="h-24 my-8" />
      
      {recommendations.length > 0 && (
        <AnimeSection 
          title="You May Also Like" 
          animeList={recommendations.map(animeToCardProps)}
        />
      )}
    </MainLayout>
  );
};

export default AnimeDetails;
