
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      // For demo purposes, accept any admin credentials
      // In the real app, this would verify with Supabase Auth
      if (email && password) {
        // Set dummy admin session
        localStorage.setItem("adminSession", JSON.stringify({ 
          email, 
          role: "admin", 
          authenticated: true 
        }));
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        });
        
        navigate("/admin/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Please enter valid credentials",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-anime-darker py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-anime-light p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-anime-primary mb-2">OtakuFlix Admin</h1>
          <p className="text-gray-400">Sign in to access the admin panel</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-anime-dark border-gray-700"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-anime-dark border-gray-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-anime-primary focus:ring-anime-primary border-gray-700 rounded bg-anime-dark"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="text-anime-primary hover:text-anime-primary/80">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="anime-btn-primary w-full py-6"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-400">
            <p>This login is for administrators only.</p>
            <p>For regular users, no login is required.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
