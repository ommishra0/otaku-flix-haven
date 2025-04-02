
import { useState } from "react";
import { Play, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trailer } from "@/services/animeService";

interface TrailerSectionProps {
  trailers: Trailer[];
  className?: string;
}

const TrailerSection = ({ trailers, className = "" }: TrailerSectionProps) => {
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleOpenTrailer = (trailer: Trailer) => {
    setSelectedTrailer(trailer);
    setDialogOpen(true);
  };
  
  if (!trailers.length) {
    return null;
  }
  
  // Get the main trailer (first one)
  const mainTrailer = trailers[0];
  
  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Play className="text-anime-primary" size={20} />
        <span>Official Trailer</span>
      </h2>
      
      <div 
        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
        onClick={() => handleOpenTrailer(mainTrailer)}
      >
        <img 
          src={mainTrailer.thumbnail_url || "/placeholder.svg"} 
          alt={mainTrailer.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-90 group-hover:opacity-70 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-anime-primary/90 flex items-center justify-center">
            <Play size={32} fill="white" />
          </div>
        </div>
      </div>
      
      {/* More trailers section - only show if there are multiple trailers */}
      {trailers.length > 1 && (
        <div className="mt-4">
          <h3 className="text-sm text-gray-400 mb-2">More Videos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {trailers.slice(1).map((trailer) => (
              <div
                key={trailer.id}
                className="relative aspect-video rounded-md overflow-hidden cursor-pointer group"
                onClick={() => handleOpenTrailer(trailer)}
              >
                <img
                  src={trailer.thumbnail_url || "/placeholder.svg"}
                  alt={trailer.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-80 group-hover:opacity-60 transition-opacity">
                  <Play size={24} fill="white" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs line-clamp-1">{trailer.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Trailer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[900px] p-0 bg-black border-gray-800">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full"
              onClick={() => setDialogOpen(false)}
            >
              <X size={18} />
            </Button>
            <div className="aspect-video w-full">
              {selectedTrailer && (
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedTrailer.url}
                  title={selectedTrailer.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TrailerSection;
