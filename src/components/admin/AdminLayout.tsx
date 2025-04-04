
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
  Settings, 
  Import
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminUser, logoutAdmin } = useAdminAuth();
  
  if (!adminUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-anime-darker">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-anime-primary"></div>
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-anime-darker">
        {/* Top Navigation */}
        <header className="bg-anime-light border-b border-gray-800 py-3 px-4 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-3 text-gray-400 hover:text-white" />
              <h1 className="text-xl font-bold text-white">OtakuFlix Admin</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{adminUser.email}</p>
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
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <TooltipProvider>
            <Sidebar variant="inset" side="left" className="border-r border-gray-800">
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Dashboard" isActive={window.location.pathname === "/admin/dashboard"}>
                      <Link to="/admin/dashboard" className="flex items-center gap-3">
                        <Home size={20} />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Anime Library" isActive={window.location.pathname === "/admin/anime"}>
                      <Link to="/admin/anime" className="flex items-center gap-3">
                        <LayoutGrid size={20} />
                        <span>Anime Library</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Episodes" isActive={window.location.pathname === "/admin/episodes"}>
                      <Link to="/admin/episodes" className="flex items-center gap-3">
                        <FileVideo size={20} />
                        <span>Episodes</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Categories" isActive={window.location.pathname === "/admin/categories"}>
                      <Link to="/admin/categories" className="flex items-center gap-3">
                        <ListFilter size={20} />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Import" isActive={window.location.pathname === "/admin/import"}>
                      <Link to="/admin/import" className="flex items-center gap-3">
                        <Import size={20} />
                        <span>Import Anime</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip="Settings" isActive={window.location.pathname === "/admin/settings"}>
                      <Link to="/admin/settings" className="flex items-center gap-3">
                        <Settings size={20} />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
              
              <SidebarFooter className="pt-2">
                <div className="px-4 py-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2 text-white border-gray-700 hover:bg-anime-primary hover:text-white"
                    onClick={logoutAdmin}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </Button>
                </div>
              </SidebarFooter>
            </Sidebar>
          </TooltipProvider>
          
          {/* Main Content */}
          <main className="flex-1 overflow-auto bg-anime-dark">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">{title}</h2>
              </div>
              
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
