import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container my-4">Cargando sesión...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
