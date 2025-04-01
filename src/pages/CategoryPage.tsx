
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import AnimeCard from "@/components/home/AnimeCard";
import { Category, fetchCategoryById, getAnimeByCategory } from "@/services/categoryService";
import { fetchAllCategories } from "@/services/categoryService";

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [animeList, setAnimeList] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllCategories = async () => {
      const categories = await fetchAllCategories();
      setAllCategories(categories);
    };

    loadAllCategories();
  }, []);

  useEffect(() => {
    const loadCategoryData = async () => {
      setLoading(true);
      if (id) {
        const categoryData = await fetchCategoryById(id);
        setCategory(categoryData);
        
        if (categoryData) {
          const animeData = await getAnimeByCategory(id);
          setAnimeList(animeData);
        }
      }
      setLoading(false);
    };

    loadCategoryData();
  }, [id]);

  // If no specific category is selected, show all categories
  if (!id) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8 text-white">Browse Categories</h1>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allCategories.map((category) => (
                <Link 
                  key={category.id} 
                  to={`/categories/${category.id}`}
                  className="bg-anime-dark hover:bg-anime-light transition-colors rounded-lg overflow-hidden shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {category.image_url ? (
                      <img 
                        src={category.image_url} 
                        alt={category.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full bg-anime-primary/30 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">{category.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                      <h3 className="text-xl font-bold text-white">{category.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        ) : (
          <>
            {category ? (
              <>
                <div className="mb-8">
                  <Link to="/categories" className="text-anime-primary hover:underline">
                    ← Back to Categories
                  </Link>
                  <h1 className="text-3xl font-bold mt-4 mb-2 text-white">{category.name}</h1>
                  {category.description && (
                    <p className="text-gray-400">{category.description}</p>
                  )}
                </div>
                
                {animeList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {animeList.map((anime) => (
                      <AnimeCard
                        key={anime.id}
                        id={anime.id}
                        title={anime.title}
                        image={anime.image_url || '/placeholder.svg'}
                        rating={anime.rating}
                        year={anime.release_year}
                        type={anime.type}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No anime found in this category.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-white mb-4">Category Not Found</h2>
                <p className="text-gray-400 mb-8">The category you're looking for doesn't exist or has been removed.</p>
                <Link 
                  to="/categories" 
                  className="px-6 py-2 bg-anime-primary text-white rounded-md hover:bg-anime-primary/80 transition-colors"
                >
                  Browse All Categories
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
