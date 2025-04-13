import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAdminSession } from "../services/auth";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({
  children,
}) => {
  const admin = getAdminSession();

  if (!admin) {
    console.warn("⚠️ Acceso denegado: No hay administrador en sesión.");
    return <Navigate to="/admin-login" />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
