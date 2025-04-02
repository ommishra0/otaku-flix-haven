
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Plus, Trash2, FileVideo, Languages, Settings } from "lucide-react";
import { updateEpisodeStreamingInfo } from "@/services/animeService";

interface StreamingInfoFormProps {
  episodeId: string;
  initialVideoUrl?: string;
  initialSubtitles?: { language: string; url: string }[];
  initialQualityOptions?: { quality: string; url: string }[];
  onSuccess?: () => void;
}

const StreamingInfoForm = ({
  episodeId,
  initialVideoUrl = "",
  initialSubtitles = [],
  initialQualityOptions = [],
  onSuccess
}: StreamingInfoFormProps) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [subtitles, setSubtitles] = useState(initialSubtitles);
  const [qualityOptions, setQualityOptions] = useState(initialQualityOptions);
  const [isLoading, setIsLoading] = useState(false);
  
  // Handle adding a subtitle
  const addSubtitle = () => {
    setSubtitles([...subtitles, { language: "", url: "" }]);
  };
  
  // Handle removing a subtitle
  const removeSubtitle = (index: number) => {
    const newSubtitles = [...subtitles];
    newSubtitles.splice(index, 1);
    setSubtitles(newSubtitles);
  };
  
  // Handle subtitle change
  const handleSubtitleChange = (index: number, field: "language" | "url", value: string) => {
    const newSubtitles = [...subtitles];
    newSubtitles[index][field] = value;
    setSubtitles(newSubtitles);
  };
  
  // Handle adding a quality option
  const addQualityOption = () => {
    setQualityOptions([...qualityOptions, { quality: "", url: "" }]);
  };
  
  // Handle removing a quality option
  const removeQualityOption = (index: number) => {
    const newQualityOptions = [...qualityOptions];
    newQualityOptions.splice(index, 1);
    setQualityOptions(newQualityOptions);
  };
  
  // Handle quality option change
  const handleQualityOptionChange = (index: number, field: "quality" | "url", value: string) => {
    const newQualityOptions = [...qualityOptions];
    newQualityOptions[index][field] = value;
    setQualityOptions(newQualityOptions);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Filter out incomplete entries
      const validSubtitles = subtitles.filter(sub => sub.language && sub.url);
      const validQualityOptions = qualityOptions.filter(opt => opt.quality && opt.url);
      
      const success = await updateEpisodeStreamingInfo(
        episodeId,
        videoUrl,
        validSubtitles,
        validQualityOptions
      );
      
      if (success && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="bg-anime-dark border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileVideo className="text-anime-primary" size={20} />
          <span>Streaming Information</span>
        </CardTitle>
        <CardDescription>
          Configure video URL, quality options, and subtitles for this episode
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Main Video URL */}
          <div>
            <Label htmlFor="video-url">Main Video URL</Label>
            <Input
              id="video-url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="bg-anime-light border-gray-700 mt-1"
            />
            <p className="text-xs text-gray-400 mt-1">
              Direct link to the video file (mp4, webm, etc.)
            </p>
          </div>
          
          {/* Quality Options */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-2">
                <Settings size={16} />
                <span>Quality Options</span>
              </Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addQualityOption}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Quality</span>
              </Button>
            </div>
            
            {qualityOptions.length === 0 ? (
              <p className="text-sm text-gray-400 py-3">
                No quality options added. Add quality options to allow users to switch video quality.
              </p>
            ) : (
              <div className="space-y-3">
                {qualityOptions.map((option, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        value={option.quality}
                        onChange={(e) => handleQualityOptionChange(index, "quality", e.target.value)}
                        placeholder="720p"
                        className="bg-anime-light border-gray-700"
                      />
                    </div>
                    <div className="flex-[3]">
                      <Input
                        value={option.url}
                        onChange={(e) => handleQualityOptionChange(index, "url", e.target.value)}
                        placeholder="https://example.com/video-720p.mp4"
                        className="bg-anime-light border-gray-700"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeQualityOption(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Subtitles */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="flex items-center gap-2">
                <Languages size={16} />
                <span>Subtitles</span>
              </Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addSubtitle}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Subtitle</span>
              </Button>
            </div>
            
            {subtitles.length === 0 ? (
              <p className="text-sm text-gray-400 py-3">
                No subtitles added. Add subtitles to support multiple languages.
              </p>
            ) : (
              <div className="space-y-3">
                {subtitles.map((subtitle, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        value={subtitle.language}
                        onChange={(e) => handleSubtitleChange(index, "language", e.target.value)}
                        placeholder="English"
                        className="bg-anime-light border-gray-700"
                      />
                    </div>
                    <div className="flex-[3]">
                      <Input
                        value={subtitle.url}
                        onChange={(e) => handleSubtitleChange(index, "url", e.target.value)}
                        placeholder="https://example.com/subtitles-en.vtt"
                        className="bg-anime-light border-gray-700"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSubtitle(index)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Subtitles should be in WebVTT (.vtt) or SubRip (.srt) format
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Streaming Info"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StreamingInfoForm;
