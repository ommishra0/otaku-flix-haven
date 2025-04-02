
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { fetchAnimeCast, CastMember } from "@/services/animeService";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

const CastCrewPage = () => {
  const { id } = useParams<{ id: string }>();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {
    if (!id) return;
    
    const loadCastData = async () => {
      setIsLoading(true);
      const castData = await fetchAnimeCast(id, debouncedSearchQuery);
      setCast(castData);
      setIsLoading(false);
    };
    
    loadCastData();
  }, [id, debouncedSearchQuery]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Group cast by role
  const castByRole = cast.reduce((acc: Record<string, CastMember[]>, member) => {
    const role = member.role || "Other";
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {});
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Cast & Crew</h1>
        
        {/* Search Bar */}
        <div className="relative mb-8">
          <Input
            type="text"
            placeholder="Search cast or character name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-anime-light border-gray-700 focus:border-anime-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
          </div>
        ) : cast.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchQuery ? "No cast members match your search" : "No cast information available"}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(castByRole).map(([role, members]) => (
              <div key={role}>
                <h2 className="text-xl font-semibold mb-4 text-anime-primary">{role}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {members.map((member) => (
                    <Card key={member.id} className="bg-anime-light border-gray-700 overflow-hidden">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={member.image_url || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-white truncate">{member.name}</h3>
                        <p className="text-sm text-gray-400 truncate">{member.character_name}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CastCrewPage;
