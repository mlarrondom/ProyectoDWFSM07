import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();

  if (loading) return <p style={{ padding: 20 }}>Cargando sesión...</p>;
  if (!token) return <Navigate to="/login" replace />;

  return children;
}
