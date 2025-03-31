
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedAdminRoute from "@/components/admin/ProtectedAdminRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AnimeDetails from "./pages/AnimeDetails";
import WatchEpisode from "./pages/WatchEpisode";
import AnimeList from "./pages/AnimeList";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <TooltipProvider>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/anime/:id" element={<AnimeDetails />} />
              <Route path="/watch/:animeId/:episodeId" element={<WatchEpisode />} />
              <Route path="/anime" element={<AnimeList />} />
              <Route path="/genres/:genreId" element={<AnimeList />} />
              <Route path="/genres" element={<AnimeList />} />
              <Route path="/trending" element={<AnimeList />} />
              <Route path="/popular" element={<AnimeList />} />
              <Route path="/seasonal" element={<AnimeList />} />
              <Route path="/a-z" element={<AnimeList />} />
              <Route path="/search" element={<AnimeList />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/anime" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/episodes" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
