
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Rating } from "@/services/animeService";

interface RatingDisplayProps {
  ratings: Rating[];
  className?: string;
}

// Map of rating systems to their descriptions
const RATING_DESCRIPTIONS: Record<string, Record<string, string>> = {
  "MPAA": {
    "G": "General Audiences - All ages admitted",
    "PG": "Parental Guidance Suggested - Some material may not be suitable for children",
    "PG-13": "Parents Strongly Cautioned - Some material may be inappropriate for children under 13",
    "R": "Restricted - Under 17 requires accompanying parent or adult guardian",
    "NC-17": "No One 17 and Under Admitted"
  },
  "TV": {
    "TV-Y": "Appropriate for all children",
    "TV-Y7": "Suitable for children 7 and older",
    "TV-G": "Suitable for all ages",
    "TV-PG": "Parental guidance suggested",
    "TV-14": "May be unsuitable for children under 14",
    "TV-MA": "Mature audience only"
  },
  "ESRB": {
    "E": "Everyone",
    "E10+": "Everyone 10+",
    "T": "Teen",
    "M": "Mature 17+",
    "A": "Adults Only 18+"
  }
};

// Map of rating systems to their colors
const RATING_COLORS: Record<string, Record<string, string>> = {
  "MPAA": {
    "G": "bg-green-600",
    "PG": "bg-yellow-500",
    "PG-13": "bg-yellow-600",
    "R": "bg-red-600",
    "NC-17": "bg-red-800"
  },
  "TV": {
    "TV-Y": "bg-green-500",
    "TV-Y7": "bg-green-600",
    "TV-G": "bg-green-700",
    "TV-PG": "bg-yellow-500",
    "TV-14": "bg-yellow-600",
    "TV-MA": "bg-red-600"
  },
  "ESRB": {
    "E": "bg-green-600",
    "E10+": "bg-green-700",
    "T": "bg-yellow-600",
    "M": "bg-red-600",
    "A": "bg-red-800"
  }
};

const RatingDisplay = ({ ratings, className = "" }: RatingDisplayProps) => {
  if (!ratings.length) {
    return null;
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <TooltipProvider>
        {ratings.map((rating) => {
          const system = rating.system;
          const value = rating.value;
          const description = RATING_DESCRIPTIONS[system]?.[value] || "No description available";
          const bgColor = RATING_COLORS[system]?.[value] || "bg-gray-600";
          
          return (
            <Tooltip key={`${system}-${value}`}>
              <TooltipTrigger asChild>
                <div className={`rounded px-2 py-1 flex items-center gap-1 ${bgColor}`}>
                  <span className="font-medium text-white text-sm">{value}</span>
                  <Info size={12} className="text-white/80" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-anime-dark border-gray-700">
                <p><strong>{system}</strong>: {description}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
};

export default RatingDisplay;
