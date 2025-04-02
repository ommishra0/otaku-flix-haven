
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AdminSession {
  email: string;
  role: string;
  authenticated: boolean;
}

interface AdminAuthContextType {
  adminUser: AdminSession | null;
  isAdminAuthenticated: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminSession | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check for existing admin session on load
  useEffect(() => {
    const checkAdminSession = () => {
      const storedSession = localStorage.getItem("adminSession");
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          if (sessionData.authenticated && sessionData.role === "admin") {
            setAdminUser(sessionData);
            setIsAdminAuthenticated(true);
            console.log("Admin session restored:", sessionData);
          }
        } catch (error) {
          console.error("Error parsing admin session:", error);
          localStorage.removeItem("adminSession");
          setIsAdminAuthenticated(false);
          setAdminUser(null);
        }
      }
    };

    checkAdminSession();
  }, []);

  // Login admin user
  const loginAdmin = async (email: string, password: string): Promise<void> => {
    try {
      // In a real app, this would verify with a backend service
      // For demo, we'll accept any non-empty credentials
      if (email && password) {
        const adminSession = {
          email,
          role: "admin",
          authenticated: true
        };
        
        // Store admin session
        localStorage.setItem("adminSession", JSON.stringify(adminSession));
        setAdminUser(adminSession);
        setIsAdminAuthenticated(true);
        
        toast.success("Login successful. Welcome to the admin panel!");
        
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast.error("Login failed. Please enter valid credentials.");
      throw error;
    }
  };

  // Logout admin user
  const logoutAdmin = () => {
    localStorage.removeItem("adminSession");
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    
    toast.success("You have been successfully logged out");
    
    navigate("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
