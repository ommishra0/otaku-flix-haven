
import { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import AnimeSection from '@/components/home/AnimeSection';
import { AnimeCardProps, animeToCardProps } from '@/components/home/AnimeCard';
import { fetchTrendingAnime, fetchPopularAnime, Anime } from '@/services/animeService';
import { toast } from '@/hooks/use-toast';

const Index = () => {
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
        toast({
          title: 'Error',
          description: 'Failed to load anime data. Please try again later.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
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
  );
};

export default Index;
