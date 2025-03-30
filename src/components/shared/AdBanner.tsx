
interface AdBannerProps {
  position: 'top' | 'sidebar' | 'bottom';
  className?: string;
}

const AdBanner = ({ position, className = '' }: AdBannerProps) => {
  // This would typically load real ad content from a service
  return (
    <div 
      className={`bg-anime-light border border-gray-700 flex items-center justify-center ${className}`}
    >
      <p className="text-gray-400 p-4 text-center">Advertisement</p>
    </div>
  );
};

export default AdBanner;
