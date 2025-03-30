
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, X, Film, Calendar, Layout, List, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
    // Redirect to search page with query
    window.location.href = `/search?q=${searchQuery}`;
  };

  return (
    <nav className="bg-anime-darker text-white py-3 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-anime-primary">OtakuFlix</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-white">
                  <span>Browse</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-anime-darker border-anime-light">
                <DropdownMenuItem className="text-white hover:bg-anime-light">
                  <Link to="/anime" className="flex items-center gap-2">
                    <Film size={16} />
                    <span>All Anime</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-anime-light">
                  <Link to="/genres" className="flex items-center gap-2">
                    <Layout size={16} />
                    <span>Genres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-anime-light">
                  <Link to="/seasonal" className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Seasonal</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-anime-light">
                  <Link to="/a-z" className="flex items-center gap-2">
                    <List size={16} />
                    <span>A-Z List</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/trending" className="text-white hover:text-anime-primary transition-colors">
              Trending
            </Link>
            <Link to="/popular" className="text-white hover:text-anime-primary transition-colors">
              Popular
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-anime-light px-4 py-2 rounded-full pr-10 w-[200px] lg:w-[300px] text-sm focus:outline-none focus:ring-2 focus:ring-anime-primary"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-4">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-anime-light px-4 py-2 rounded-full pr-10 w-full text-sm focus:outline-none focus:ring-2 focus:ring-anime-primary"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-400">
                <Search size={16} />
              </button>
            </form>
            <div className="flex flex-col space-y-4">
              <Link 
                to="/anime" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                All Anime
              </Link>
              <Link 
                to="/genres" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Genres
              </Link>
              <Link 
                to="/seasonal" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Seasonal
              </Link>
              <Link 
                to="/trending" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Trending
              </Link>
              <Link 
                to="/popular" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Popular
              </Link>
              <Link 
                to="/a-z" 
                className="text-white hover:text-anime-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                A-Z List
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
