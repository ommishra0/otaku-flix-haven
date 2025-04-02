
import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import AnimeSection from '@/components/home/AnimeSection';
import { AnimeCardProps, animeToCardProps } from '@/components/home/AnimeCard';
import { fetchTrendingAnime, fetchPopularAnime, Anime } from '@/services/animeService';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import MainLayout from '@/components/layout/MainLayout';

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
        
        // Fetch trending anime
        const trendingData = await fetchTrendingAnime();
        setTrendingAnime(trendingData.map(animeToCardProps));
        
        // Fetch popular anime
        const popularData = await fetchPopularAnime();
        setPopularAnime(popularData.map(animeToCardProps));
        
        // Set featured anime (using trending or popular anime for now)
        setFeaturedAnime(trendingData.length > 0 ? trendingData.slice(0, 3) : []);
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
            <Hero featuredAnime={featuredAnime} />
            
            {/* Trending Anime */}
            <AnimeSection 
              title="Trending Anime" 
              viewAllLink="/trending" 
              animeList={trendingAnime} 
            />
            
            {/* Popular Anime */}
            <AnimeSection 
              title="Popular Anime" 
              viewAllLink="/popular" 
              animeList={popularAnime} 
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
