
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAdminAuthenticated } = useAdminAuth();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast({
        title: "Access denied",
        description: "You must be logged in as an administrator to view this page",
        variant: "destructive",
      });
    }
  }, [isAdminAuthenticated, toast]);

  if (!isAdminAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
