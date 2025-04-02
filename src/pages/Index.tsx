
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import AnimeSection from "@/components/home/AnimeSection";
import GenreTags from "@/components/home/GenreTags";
import AdBanner from "@/components/shared/AdBanner";
import { fetchTrendingAnime, fetchPopularAnime, Anime } from "@/services/animeService";
import { animeToCardProps } from "@/components/home/AnimeCard";

const Index = () => {
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [newReleases, setNewReleases] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [trending, popular] = await Promise.all([
          fetchTrendingAnime(10),
          fetchPopularAnime(10)
        ]);
        
        setTrendingAnime(trending);
        setPopularAnime(popular);
        
        // For new releases, we'll use a subset of the popular anime for now
        // In a real implementation, this would fetch the most recently added anime
        setNewReleases(popular.slice(0, 6));
      } catch (error) {
        console.error("Error fetching anime data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <MainLayout>
      <Hero />
      
      <AdBanner position="top" className="h-20 mb-8" />
      
      {isLoading ? (
        <div className="container mx-auto py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
        </div>
      ) : (
        <>
          <AnimeSection 
            title="Trending Now" 
            viewAllLink="/trending"
            animeList={trendingAnime.map(animeToCardProps)}
          />
          
          <AnimeSection 
            title="Popular Anime" 
            viewAllLink="/popular"
            animeList={popularAnime.map(animeToCardProps)}
          />
          
          <AnimeSection 
            title="New Releases" 
            viewAllLink="/latest"
            animeList={newReleases.map(animeToCardProps)}
          />
          
          <GenreTags />
        </>
      )}
      
      <AdBanner position="bottom" className="h-24 mt-4" />
    </MainLayout>
  );
};

export default Index;
