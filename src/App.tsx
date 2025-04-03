
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Auth from "@/pages/Auth";
import AnimeDetails from "@/pages/AnimeDetails";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import WatchEpisode from "@/pages/WatchEpisode";
import { AuthProvider } from "@/contexts/AuthContext";
import AnimeList from "@/pages/AnimeList";
import CategoryPage from "@/pages/CategoryPage";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import ForumPage from "@/pages/ForumPage";
import ForumTopicPage from "@/pages/ForumTopicPage";
import NewForumTopicPage from "@/pages/NewForumTopicPage";
import CastCrewPage from "@/components/anime/CastCrewPage";
import AnimeImport from "@/pages/admin/AnimeImport";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/anime/:id/cast" element={<CastCrewPage />} />
              <Route path="/watch/:animeId/:episodeId" element={<WatchEpisode />} />
              <Route path="/anime" element={<AnimeList />} />
              <Route path="/category/:categoryId" element={<CategoryPage />} />
              <Route path="/forum" element={<ForumPage />} />
              <Route path="/forum/topic/:topicId" element={<ForumTopicPage />} />
              <Route path="/forum/new" element={<NewForumTopicPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/anime" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/episodes" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route 
                path="/admin/import" 
                element={
                  <ProtectedAdminRoute>
                    <AnimeImport />
                  </ProtectedAdminRoute>
                } 
              />
            </Routes>
            <Toaster richColors position="top-center" />
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
