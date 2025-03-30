import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { 
  FileVideo, 
  Home, 
  LayoutGrid, 
  ListFilter, 
  LogOut, 
  Menu, 
  Settings, 
  X 
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminUser, logoutAdmin } = useAdminAuth();
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-anime-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-anime-darker flex flex-col">
      {/* Top Navigation */}
      <header className="bg-anime-light border-b border-gray-800 py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="lg:hidden mr-3 text-gray-400 hover:text-white"
              onClick={toggleMobileSidebar}
            >
              <Menu size={24} />
            </button>
            <button 
              className="hidden lg:block mr-3 text-gray-400 hover:text-white"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold">OtakuFlix Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{adminUser.email}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={logoutAdmin}
            >
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside 
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:static lg:inset-auto transition duration-300 ease-in-out z-30 w-64 bg-anime-light border-r border-gray-800 pt-16 lg:pt-0 overflow-y-auto`}
        >
          <div className="p-4">
            <nav className="space-y-1">
              <Link 
                to="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
              >
                <Home size={18} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/admin/anime"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
              >
                <LayoutGrid size={18} />
                <span>Anime Library</span>
              </Link>
              <Link 
                to="/admin/episodes"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
              >
                <FileVideo size={18} />
                <span>Episodes</span>
              </Link>
              <Link 
                to="/admin/categories"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
              >
                <ListFilter size={18} />
                <span>Categories</span>
              </Link>
              <Link 
                to="/admin/settings"
                className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
              >
                <Settings size={18} />
                <span>Settings</span>
              </Link>
            </nav>
          </div>
        </aside>
        
        {/* Mobile Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={toggleMobileSidebar}>
            <aside 
              className="fixed inset-y-0 left-0 w-64 bg-anime-light border-r border-gray-800 overflow-y-auto z-40"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="font-bold text-lg">Menu</h2>
                <button 
                  className="text-gray-400 hover:text-white"
                  onClick={toggleMobileSidebar}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4">
                <nav className="space-y-1">
                  <Link 
                    to="/admin/dashboard"
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    <Home size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/admin/anime"
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    <LayoutGrid size={18} />
                    <span>Anime Library</span>
                  </Link>
                  <Link 
                    to="/admin/episodes"
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    <FileVideo size={18} />
                    <span>Episodes</span>
                  </Link>
                  <Link 
                    to="/admin/categories"
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    <ListFilter size={18} />
                    <span>Categories</span>
                  </Link>
                  <Link 
                    to="/admin/settings"
                    className="flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-anime-primary hover:text-white rounded-md transition-colors"
                    onClick={toggleMobileSidebar}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </aside>
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-anime-dark">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
