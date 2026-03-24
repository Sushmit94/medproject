import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export default function ProtectedRoute({ children, roles, redirectTo = "/login" }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
        <p className="text-red-600 font-semibold text-lg">Access Denied</p>
        <p className="text-gray-600 mt-2">You don't have permission to access this section.</p>
        <a href="/" className="mt-4 text-primary underline hover:no-underline">Go to Homepage</a>
      </div>
    );
  }

  return <>{children}</>;
}
