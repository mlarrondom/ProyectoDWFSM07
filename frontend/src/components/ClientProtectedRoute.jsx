import { Navigate, useLocation } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";

export default function ClientProtectedRoute({ children }) {
    const { clientToken } = useClientAuth();
    const location = useLocation();

    if (!clientToken) {
        const nextPath = location.pathname + (location.search || "");
        sessionStorage.setItem("post_login_redirect", nextPath);

        return <Navigate to="/client/login" replace />;
    }

    return children;
}