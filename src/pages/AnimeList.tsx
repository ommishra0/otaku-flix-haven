
import { useState } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import AnimeCard from "@/components/home/AnimeCard";
import AdBanner from "@/components/shared/AdBanner";
import { trendingAnime, popularAnime, newReleases } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

// Combine all anime for the list
const allAnime = [...trendingAnime, ...popularAnime, ...newReleases];

const genres = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", 
  "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
  "Sports", "Supernatural", "Thriller"
];

const years = ["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"];

const AnimeList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("popularity");
  
  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };
  
  const toggleYear = (year: string) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      setSelectedYears([...selectedYears, year]);
    }
  };
  
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };
  
  const toggleStatus = (status: string) => {
    if (selectedStatus.includes(status)) {
      setSelectedStatus(selectedStatus.filter(s => s !== status));
    } else {
      setSelectedStatus([...selectedStatus, status]);
    }
  };
  
  const clearAllFilters = () => {
    setSelectedGenres([]);
    setSelectedYears([]);
    setSelectedTypes([]);
    setSelectedStatus([]);
    setSortBy("popularity");
  };
  
  const filteredAnime = allAnime.filter(anime => {
    // Search filter
    if (searchQuery && !anime.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Year filter
    if (selectedYears.length > 0 && !selectedYears.includes(anime.year?.toString() || "")) {
      return false;
    }
    
    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes(anime.type || "")) {
      return false;
    }
    
    return true;
  });
  
  // Sort anime
  const sortedAnime = [...filteredAnime].sort((a, b) => {
    if (sortBy === "newest") {
      return (b.year || 0) - (a.year || 0);
    } else if (sortBy === "oldest") {
      return (a.year || 0) - (b.year || 0);
    } else if (sortBy === "rating") {
      return (b.rating || 0) - (a.rating || 0);
    } else if (sortBy === "title-asc") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    // Default: popularity
    return 0;
  });
  
  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden md:block w-64 sticky top-24">
          <div className="bg-anime-light rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Filters</h3>
              {(selectedGenres.length > 0 || selectedYears.length > 0 || selectedTypes.length > 0 || selectedStatus.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear All
                </Button>
              )}
            </div>
            
            <Accordion type="multiple" defaultValue={["genres", "year", "type", "status"]}>
              <AccordionItem value="genres">
                <AccordionTrigger>Genres</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {genres.map(genre => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`genre-${genre}`} 
                          checked={selectedGenres.includes(genre)}
                          onCheckedChange={() => toggleGenre(genre)}
                        />
                        <label 
                          htmlFor={`genre-${genre}`}
                          className="text-sm cursor-pointer"
                        >
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="year">
                <AccordionTrigger>Year</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {years.map(year => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`year-${year}`} 
                          checked={selectedYears.includes(year)}
                          onCheckedChange={() => toggleYear(year)}
                        />
                        <label 
                          htmlFor={`year-${year}`}
                          className="text-sm cursor-pointer"
                        >
                          {year}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="type">
                <AccordionTrigger>Type</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {["TV", "Movie", "OVA", "Special"].map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`type-${type}`} 
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleType(type)}
                        />
                        <label 
                          htmlFor={`type-${type}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="status">
                <AccordionTrigger>Status</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 mt-2">
                    {["Ongoing", "Completed", "Upcoming"].map(status => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`status-${status}`} 
                          checked={selectedStatus.includes(status)}
                          onCheckedChange={() => toggleStatus(status)}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="text-sm cursor-pointer"
                        >
                          {status}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Sort By</h3>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-anime-dark border border-gray-700 rounded-md p-2 text-sm"
              >
                <option value="popularity">Popularity</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rating">Rating</option>
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
              </select>
            </div>
          </div>
          
          <AdBanner position="sidebar" className="mt-6 h-[400px]" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <h1 className="text-2xl font-bold">Browse Anime</h1>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <form className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-anime-light pl-10 pr-4 py-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-anime-primary text-sm"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
              
              <Button 
                variant="outline" 
                className="md:hidden flex items-center gap-1"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal size={16} />
                <span>Filters</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Filters */}
          {showFilters && (
            <div className="md:hidden bg-anime-light rounded-lg p-4 mb-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowFilters(false)}
                  className="text-xs"
                >
                  <X size={16} />
                </Button>
              </div>
              
              <Accordion type="single" collapsible>
                <AccordionItem value="genres">
                  <AccordionTrigger>Genres</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {genres.map(genre => (
                        <div key={genre} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-genre-${genre}`} 
                            checked={selectedGenres.includes(genre)}
                            onCheckedChange={() => toggleGenre(genre)}
                          />
                          <label 
                            htmlFor={`mobile-genre-${genre}`}
                            className="text-sm cursor-pointer"
                          >
                            {genre}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="year">
                  <AccordionTrigger>Year</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {years.map(year => (
                        <div key={year} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-year-${year}`} 
                            checked={selectedYears.includes(year)}
                            onCheckedChange={() => toggleYear(year)}
                          />
                          <label 
                            htmlFor={`mobile-year-${year}`}
                            className="text-sm cursor-pointer"
                          >
                            {year}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="type">
                  <AccordionTrigger>Type</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {["TV", "Movie", "OVA", "Special"].map(type => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`mobile-type-${type}`} 
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={() => toggleType(type)}
                          />
                          <label 
                            htmlFor={`mobile-type-${type}`}
                            className="text-sm cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Sort By</h3>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-anime-dark border border-gray-700 rounded-md p-2 text-sm"
                >
                  <option value="popularity">Popularity</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating">Rating</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                </select>
              </div>
              
              <div className="mt-4 flex justify-between">
                <Button 
                  variant="outline"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
          
          {/* Applied Filters */}
          {(selectedGenres.length > 0 || selectedYears.length > 0 || selectedTypes.length > 0 || selectedStatus.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedGenres.map(genre => (
                <div 
                  key={genre}
                  className="bg-anime-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span>{genre}</span>
                  <button onClick={() => toggleGenre(genre)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {selectedYears.map(year => (
                <div 
                  key={year}
                  className="bg-anime-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span>{year}</span>
                  <button onClick={() => toggleYear(year)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {selectedTypes.map(type => (
                <div 
                  key={type}
                  className="bg-anime-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span>{type}</span>
                  <button onClick={() => toggleType(type)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {selectedStatus.map(status => (
                <div 
                  key={status}
                  className="bg-anime-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-1"
                >
                  <span>{status}</span>
                  <button onClick={() => toggleStatus(status)}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              <button 
                className="text-gray-400 text-sm hover:text-white"
                onClick={clearAllFilters}
              >
                Clear All
              </button>
            </div>
          )}
          
          {/* Results */}
          <div className="mb-4 text-gray-400 text-sm">
            Found {sortedAnime.length} anime
          </div>
          
          {sortedAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sortedAnime.map(anime => (
                <AnimeCard key={anime.id} {...anime} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">No anime found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your filters or search query</p>
              <Button onClick={clearAllFilters}>Clear Filters</Button>
            </div>
          )}
          
          <AdBanner position="bottom" className="h-24 mt-8" />
        </div>
      </div>
    </MainLayout>
  );
};

export default AnimeList;
