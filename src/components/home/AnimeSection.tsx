
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimeCard, { AnimeCardProps } from './AnimeCard';

interface AnimeSectionProps {
  title: string;
  viewAllLink?: string;
  animeList: AnimeCardProps[];
}

const AnimeSection = ({ title, viewAllLink, animeList }: AnimeSectionProps) => {
  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="section-title">{title}</h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink} 
            className="flex items-center text-anime-primary hover:text-anime-primary/80 transition-colors"
          >
            <span>View All</span>
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animeList.map((anime) => (
          <AnimeCard key={anime.id} {...anime} />
        ))}
      </div>
    </section>
  );
};

export default AnimeSection;
