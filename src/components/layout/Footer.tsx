
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-anime-darker text-white py-10 mt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-anime-primary">OtakuFlix</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for anime streaming. Watch your favorite anime shows and movies online.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/anime" className="text-gray-400 hover:text-white transition-colors">Browse Anime</Link></li>
              <li><Link to="/genres" className="text-gray-400 hover:text-white transition-colors">Genres</Link></li>
              <li><Link to="/seasonal" className="text-gray-400 hover:text-white transition-colors">Seasonal</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/genres/action" className="text-gray-400 hover:text-white transition-colors">Action</Link></li>
              <li><Link to="/genres/adventure" className="text-gray-400 hover:text-white transition-colors">Adventure</Link></li>
              <li><Link to="/genres/comedy" className="text-gray-400 hover:text-white transition-colors">Comedy</Link></li>
              <li><Link to="/genres/drama" className="text-gray-400 hover:text-white transition-colors">Drama</Link></li>
              <li><Link to="/genres/fantasy" className="text-gray-400 hover:text-white transition-colors">Fantasy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/dmca" className="text-gray-400 hover:text-white transition-colors">DMCA</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} OtakuFlix. All rights reserved.</p>
          <p className="mt-2">This site does not store any files on its server. All contents are provided by non-affiliated third parties.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
