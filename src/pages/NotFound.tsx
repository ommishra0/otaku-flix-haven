
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-6xl md:text-8xl font-bold text-anime-primary mb-6">404</h1>
        <p className="text-xl md:text-2xl text-white mb-8">Oops! We couldn't find that page</p>
        <p className="text-gray-400 max-w-md text-center mb-10">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/">
          <Button className="anime-btn-primary">Return to Homepage</Button>
        </Link>
      </div>
    </MainLayout>
  );
};

export default NotFound;
