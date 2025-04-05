
import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import AnimeSection from '@/components/home/AnimeSection';
import { AnimeCardProps, animeToCardProps } from '@/components/home/AnimeCard';
import { fetchTrendingAnime, fetchPopularAnime, Anime } from '@/services/animeService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MainLayout from '@/components/layout/MainLayout';
import { getTrendingAniListAnime } from '@/services/anilistService';

const Index = () => {
  const isMobile = useIsMobile();
  const [trendingAnime, setTrendingAnime] = useState<AnimeCardProps[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeCardProps[]>([]);
  const [featuredAnime, setFeaturedAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // First attempt to fetch from our database
        let trendingData = await fetchTrendingAnime();
        let popularData = await fetchPopularAnime();
        
        // If there's no trending anime in the database, try fetching from AniList
        if (trendingData.length === 0) {
          console.log("No trending anime found in database, attempting to fetch from AniList");
          
          // Get trending anime from AniList
          const anilistTrending = await getTrendingAniListAnime();
          
          // Use these for display even though they're not in the database yet
          if (anilistTrending.length > 0) {
            // Convert AniList media to a format compatible with our AnimeCardProps
            const anilistCards = anilistTrending.map(anime => ({
              id: anime.id,
              title: anime.title.english || anime.title.romaji || 'Unknown',
              image: anime.coverImage.large || anime.coverImage.medium || '/placeholder.svg',
              rating: anime.vote_average || undefined,
              type: anime.format || undefined,
              year: anime.startDate.year || undefined
            }));
            
            setTrendingAnime(anilistCards);
            
            // If we have AniList data but no database data, use AniList for featured too
            if (anilistTrending.length > 0) {
              // Create a minimal anime object from AniList data for the featured section
              const featuredFromAniList = anilistTrending.slice(0, 3).map(anime => ({
                id: anime.id.toString(),
                title: anime.title.english || anime.title.romaji || 'Unknown',
                description: anime.description || '',
                image_url: anime.coverImage.large || anime.coverImage.medium || '/placeholder.svg',
                banner_image_url: anime.bannerImage || anime.coverImage.large || '',
                rating: anime.vote_average || 0,
              } as Anime));
              
              setFeaturedAnime(featuredFromAniList);
            }
          }
        } else {
          // If we have database anime, use that
          setTrendingAnime(trendingData.map(animeToCardProps));
          setFeaturedAnime(trendingData.length > 0 ? trendingData.slice(0, 3) : []);
        }
        
        // Set popular anime if available from database
        if (popularData.length > 0) {
          setPopularAnime(popularData.map(animeToCardProps));
        }
      } catch (error) {
        console.error('Error loading home page data:', error);
        toast.error('Failed to load anime data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <MainLayout>
      <div className={`container mx-auto px-${isMobile ? '2' : '4'} py-${isMobile ? '4' : '8'}`}>
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        ) : (
          <>
            {/* Hero section */}
            {featuredAnime.length > 0 && <Hero featuredAnime={featuredAnime} />}
            
            {/* Trending Anime */}
            {trendingAnime.length > 0 && (
              <AnimeSection 
                title="Trending Anime" 
                viewAllLink="/trending" 
                animeList={trendingAnime} 
              />
            )}
            
            {/* Popular Anime */}
            {popularAnime.length > 0 && (
              <AnimeSection 
                title="Popular Anime" 
                viewAllLink="/popular" 
                animeList={popularAnime} 
              />
            )}
            
            {trendingAnime.length === 0 && popularAnime.length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-4">No Anime Found</h2>
                <p className="text-gray-400">
                  Try importing anime from the Admin panel or check your database connection.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
