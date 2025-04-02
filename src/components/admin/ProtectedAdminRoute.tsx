
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { toast } from "sonner";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { isAdminAuthenticated } = useAdminAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isAdminAuthenticated) {
      toast.error("Access denied. You must be logged in as an administrator to view this page");
    }
  }, [isAdminAuthenticated]);

  if (!isAdminAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
