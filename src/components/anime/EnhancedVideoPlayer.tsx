
import { useState, useRef, useEffect } from "react";
import { Subtitles, Settings, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface VideoSource {
  quality: string;
  url: string;
}

interface SubtitleTrack {
  language: string;
  url: string;
}

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  poster?: string;
  subtitles?: SubtitleTrack[];
  qualityOptions?: VideoSource[];
  onProgress?: (progress: number, completed: boolean) => void;
  onError?: (error: any) => void;
}

const EnhancedVideoPlayer = ({
  videoUrl,
  poster,
  subtitles = [],
  qualityOptions = [],
  onProgress,
  onError
}: EnhancedVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string>(
    qualityOptions.length > 0 ? qualityOptions[0].quality : "Auto"
  );
  const [currentSource, setCurrentSource] = useState(videoUrl);
  
  const controlsTimeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Report progress to parent component if callback provided
      if (onProgress) {
        const progress = Math.floor(video.currentTime);
        const isComplete = video.currentTime / video.duration > 0.9;
        onProgress(progress, isComplete);
      }
    };
    
    const handleVideoEnd = () => {
      setIsPlaying(false);
    };
    
    const handleError = (e: any) => {
      console.error("Video playback error:", e);
      if (onError) onError(e);
    };
    
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleVideoEnd);
    video.addEventListener("error", handleError);
    
    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleVideoEnd);
      video.removeEventListener("error", handleError);
    };
  }, [onProgress, onError]);
  
  useEffect(() => {
    // Update source URL when quality changes
    if (qualityOptions.length > 0) {
      const selectedSource = qualityOptions.find(q => q.quality === selectedQuality);
      if (selectedSource) {
        setCurrentSource(selectedSource.url);
        
        // Remember current time
        const currentTimeBeforeSwitch = videoRef.current?.currentTime || 0;
        
        // Add event listener to resume playback at the same position
        const handleSourceLoaded = () => {
          if (videoRef.current) {
            videoRef.current.currentTime = currentTimeBeforeSwitch;
            if (isPlaying) videoRef.current.play();
          }
        };
        
        videoRef.current?.addEventListener("loadeddata", handleSourceLoaded, { once: true });
      }
    } else {
      setCurrentSource(videoUrl);
    }
  }, [selectedQuality, qualityOptions, videoUrl, isPlaying]);
  
  // Handle auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    if (showControls && isPlaying) {
      // @ts-ignore - setTimeout returns number in browser
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    }
    
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);
  
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(err => {
        console.error("Error playing video:", err);
        if (onError) onError(err);
      });
      setIsPlaying(true);
    }
  };
  
  const handleVolumeChange = (newVolume: number[]) => {
    const value = newVolume[0];
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value;
    }
  };
  
  const handleSeek = (newTime: number[]) => {
    const seekTime = newTime[0];
    setCurrentTime(seekTime);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  
  const handleSubtitleChange = (lang: string | null) => {
    setSelectedSubtitle(lang);
  };
  
  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
  };
  
  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden"
      onMouseMove={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        poster={poster}
        onClick={togglePlayPause}
      >
        <source src={currentSource} type="video/mp4" />
        
        {/* Subtitles */}
        {subtitles.map((track) => (
          selectedSubtitle === track.language && (
            <track
              key={track.language}
              kind="subtitles"
              src={track.url}
              srcLang={track.language}
              label={track.language}
              default={selectedSubtitle === track.language}
            />
          )
        ))}
        
        Your browser does not support the video tag.
      </video>
      
      {/* Video Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4.75a1.25 1.25 0 0 0-2 1v12.5a1.25 1.25 0 0 0 2 1V4.75z" fill="currentColor" />
                  <path d="M18.25 12L8.75 5.125v13.75L18.25 12z" fill="currentColor" />
                </svg>
              )}
            </Button>
            
            {/* Volume Control */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  {volume === 0 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3.75v16.5L7.5 16H3.75V8H7.5L12 3.75z" fill="currentColor" />
                      <path d="M16.5 12l4.5 4.5m0-9l-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3.75v16.5L7.5 16H3.75V8H7.5L12 3.75z" fill="currentColor" />
                      <path d="M15 10.5a3 3 0 0 1 0 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 3.75v16.5L7.5 16H3.75V8H7.5L12 3.75z" fill="currentColor" />
                      <path d="M15 10.5a3 3 0 0 1 0 3m3-6a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-3" side="top">
                <Slider
                  value={[volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Subtitles Menu */}
            {subtitles.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className={`text-white hover:bg-white/20 ${selectedSubtitle ? "text-anime-primary" : ""}`}
                  >
                    <Subtitles size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-anime-dark border-gray-700">
                  <DropdownMenuItem 
                    className={!selectedSubtitle ? "text-anime-primary" : ""}
                    onClick={() => handleSubtitleChange(null)}
                  >
                    Off
                  </DropdownMenuItem>
                  {subtitles.map((track) => (
                    <DropdownMenuItem
                      key={track.language}
                      className={selectedSubtitle === track.language ? "text-anime-primary" : ""}
                      onClick={() => handleSubtitleChange(track.language)}
                    >
                      {track.language}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Quality Options */}
            {qualityOptions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1 text-white text-sm hover:bg-white/20"
                  >
                    <Settings size={16} />
                    <span>{selectedQuality}</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-anime-dark border-gray-700">
                  {qualityOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.quality}
                      className={selectedQuality === option.quality ? "text-anime-primary" : ""}
                      onClick={() => handleQualityChange(option.quality)}
                    >
                      {option.quality}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Fullscreen Button */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                if (videoRef.current) {
                  if (document.fullscreenElement) {
                    document.exitFullscreen();
                  } else {
                    videoRef.current.requestFullscreen();
                  }
                }
              }}
              className="text-white hover:bg-white/20"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14h2v4h4v2H4v-6zm14 4h-4v2h6v-6h-2v4zM6 10H4V4h6v2H6v4zm8-6h4v4h2V4h-6v2z" fill="currentColor" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedVideoPlayer;
