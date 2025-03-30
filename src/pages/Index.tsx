
import MainLayout from "@/components/layout/MainLayout";
import Hero from "@/components/home/Hero";
import AnimeSection from "@/components/home/AnimeSection";
import GenreTags from "@/components/home/GenreTags";
import AdBanner from "@/components/shared/AdBanner";
import { trendingAnime, popularAnime, newReleases } from "@/data/mockData";

const Index = () => {
  return (
    <MainLayout>
      <Hero />
      
      <AdBanner position="top" className="h-20 mb-8" />
      
      <AnimeSection 
        title="Trending Now" 
        viewAllLink="/trending"
        animeList={trendingAnime}
      />
      
      <AnimeSection 
        title="Popular Anime" 
        viewAllLink="/popular"
        animeList={popularAnime}
      />
      
      <AnimeSection 
        title="New Releases" 
        viewAllLink="/latest"
        animeList={newReleases}
      />
      
      <GenreTags />
      
      <AdBanner position="bottom" className="h-24 mt-4" />
    </MainLayout>
  );
};

export default Index;
