
import { Link } from 'react-router-dom';

const genres = [
  { id: 'action', name: 'Action' },
  { id: 'adventure', name: 'Adventure' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'drama', name: 'Drama' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'horror', name: 'Horror' },
  { id: 'mecha', name: 'Mecha' },
  { id: 'music', name: 'Music' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'psychological', name: 'Psychological' },
  { id: 'romance', name: 'Romance' },
  { id: 'sci-fi', name: 'Sci-Fi' },
  { id: 'slice-of-life', name: 'Slice of Life' },
  { id: 'sports', name: 'Sports' },
  { id: 'supernatural', name: 'Supernatural' },
  { id: 'thriller', name: 'Thriller' }
];

const GenreTags = () => {
  return (
    <section className="mb-12">
      <h2 className="section-title">Popular Genres</h2>
      <div className="flex flex-wrap gap-3">
        {genres.map((genre) => (
          <Link 
            key={genre.id}
            to={`/genres/${genre.id}`}
            className="px-4 py-2 bg-anime-light rounded-md hover:bg-anime-primary transition-colors"
          >
            {genre.name}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default GenreTags;
