
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Search, Film, User, LogIn, LogOut } from "lucide-react";
import { useMedia } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const isMobile = useMedia("(max-width: 768px)");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (username: string) => {
    return username?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <nav className="bg-anime-dark border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-anime-primary">
            Anime Stream
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div className="hidden md:flex space-x-4">
              <Link
                to="/"
                className="text-gray-300 hover:text-anime-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/anime"
                className="text-gray-300 hover:text-anime-primary transition-colors"
              >
                Browse
              </Link>
              <Link
                to="/genres"
                className="text-gray-300 hover:text-anime-primary transition-colors"
              >
                Genres
              </Link>
              <Link
                to="/trending"
                className="text-gray-300 hover:text-anime-primary transition-colors"
              >
                Trending
              </Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.username || "User"} />
                      <AvatarFallback>{getInitials(profile?.username || "User")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.username || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/watchlist">
                      <Film className="mr-2 h-4 w-4" />
                      <span>My Watchlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-anime-primary hover:bg-anime-primary/90">
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-800">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-300 hover:bg-anime-dark hover:text-anime-primary"
            >
              Home
            </Link>
            <Link
              to="/anime"
              className="block px-4 py-2 text-gray-300 hover:bg-anime-dark hover:text-anime-primary"
            >
              Browse
            </Link>
            <Link
              to="/genres"
              className="block px-4 py-2 text-gray-300 hover:bg-anime-dark hover:text-anime-primary"
            >
              Genres
            </Link>
            <Link
              to="/trending"
              className="block px-4 py-2 text-gray-300 hover:bg-anime-dark hover:text-anime-primary"
            >
              Trending
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
