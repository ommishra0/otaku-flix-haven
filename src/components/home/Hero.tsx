
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Anime } from '@/services/animeService';

interface HeroProps {
  featuredAnime: Anime[];
}

const Hero = ({ featuredAnime }: HeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    if (featuredAnime.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredAnime.length);
    }, 8000); // Change slide every 8 seconds
    
    return () => clearInterval(interval);
  }, [featuredAnime.length]);
  
  if (featuredAnime.length === 0) {
    return null; // Don't render if no featured anime
  }
  
  const anime = featuredAnime[currentSlide];
  
  return (
    <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl">
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${anime.image_url || anime.banner_image_url || '/placeholder.svg'})`,
          opacity: 0.4
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-anime-darker via-anime-darker/80 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <div className="flex gap-2 mb-3">
              {(anime.genres || []).slice(0, 2).map((g, index) => (
                <span key={index} className="anime-badge">{g}</span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{anime.title}</h1>
            
            <div className="flex items-center mb-4 text-yellow-400">
              <span className="mr-2">★ {anime.rating || '4.5'}</span>
              <span className="text-gray-400">/ 5.0</span>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg line-clamp-3">{anime.description || 'No description available'}</p>
            
            <div className="flex gap-4">
              <Link to={`/anime/${anime.id}`}>
                <Button className="anime-btn-primary flex items-center gap-2 px-6 py-5">
                  <Play size={18} />
                  <span>Watch Now</span>
                </Button>
              </Link>
              
              <Link to={`/anime/${anime.id}`}>
                <Button variant="outline" className="bg-transparent border-white hover:bg-white/10 px-6 py-5">
                  Details
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {featuredAnime.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full ${
              index === currentSlide ? "bg-anime-primary w-6" : "bg-gray-500"
            } transition-all duration-300`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
