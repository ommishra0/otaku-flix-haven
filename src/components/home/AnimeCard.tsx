
import { Link } from 'react-router-dom';
import { useInView } from '@/hooks/use-intersection-observer';
import { Anime } from '@/services/animeService';

export interface AnimeCardProps {
  id: number | string;
  title: string;
  image: string;
  episodeCount?: number;
  rating?: number;
  type?: string;
  year?: number;
}

const AnimeCard = ({ id, title, image, episodeCount, rating, type, year }: AnimeCardProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  
  return (
    <Link to={`/anime/${id}`} className="anime-card group" ref={ref}>
      <div className="relative aspect-[3/4] overflow-hidden">
        {inView ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-anime-light animate-pulse"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <span className="text-sm text-gray-300">{episodeCount} Episodes</span>
          {rating && (
            <div className="flex items-center mt-1">
              <span className="text-yellow-400 text-sm">★ {rating}</span>
            </div>
          )}
        </div>
        
        {type && (
          <div className="absolute top-2 left-2 bg-anime-primary text-white text-xs px-2 py-1 rounded-sm">
            {type}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="anime-title">{title}</h3>
        {year && <p className="text-sm text-gray-400">{year}</p>}
      </div>
    </Link>
  );
};

export const animeToCardProps = (anime: Anime): AnimeCardProps => {
  return {
    id: anime.id,
    title: anime.title,
    image: anime.image_url || '/placeholder.svg',
    rating: anime.rating,
    type: anime.type,
    year: anime.release_year,
  };
};

export default AnimeCard;
