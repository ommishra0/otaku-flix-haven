
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from "@/components/ui/button";

// Mock featured anime data
const featuredAnime = [
  {
    id: 1,
    title: "Demon Slayer: Kimetsu no Yaiba",
    description: "Tanjiro Kamado's peaceful life is shattered after his family is slaughtered by a demon. His sister Nezuko is the sole survivor, but she has been transformed into a demon herself.",
    image: "https://m.media-amazon.com/images/M/MV5BZjZjNzI5MDctY2Y4YS00NmM4LTljMmItZTFkOTExNGI3ODRhXkEyXkFqcGdeQXVyNjc3MjQzNTI@._V1_.jpg",
    genre: ["Action", "Fantasy"],
    rating: 4.9
  },
  {
    id: 2,
    title: "Attack on Titan",
    description: "When man-eating Titans first appeared 100 years ago, humans found safety behind massive walls. But when a colossal Titan smashes through the barriers, humanity faces extinction.",
    image: "https://flxt.tmsimg.com/assets/p10701949_b_v8_ah.jpg",
    genre: ["Action", "Drama"],
    rating: 4.8
  },
  {
    id: 3,
    title: "My Hero Academia",
    description: "In a world where people with superpowers (called Quirks) are the norm, Izuku Midoriya has dreams of becoming a hero despite being bullied for not having a Quirk.",
    image: "https://m.media-amazon.com/images/M/MV5BOGZmYjdjN2UtNjAwZi00YmEyLWFhNTEtNjM1OTc5ODg0MGEyXkEyXkFqcGdeQXVyMTA1NjQyNjkw._V1_FMjpg_UX1000_.jpg",
    genre: ["Action", "Comedy"],
    rating: 4.7
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredAnime.length);
    }, 8000); // Change slide every 8 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const anime = featuredAnime[currentSlide];
  
  return (
    <div className="relative h-[500px] mb-12 overflow-hidden rounded-xl">
      {/* Background image with gradient overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${anime.image})`,
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
              {anime.genre.map((g, index) => (
                <span key={index} className="anime-badge">{g}</span>
              ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-3">{anime.title}</h1>
            
            <div className="flex items-center mb-4 text-yellow-400">
              <span className="mr-2">★ {anime.rating}</span>
              <span className="text-gray-400">/ 5.0</span>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg line-clamp-3">{anime.description}</p>
            
            <div className="flex gap-4">
              <Button className="anime-btn-primary flex items-center gap-2 px-6 py-5">
                <Play size={18} />
                <span>Watch Now</span>
              </Button>
              
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
