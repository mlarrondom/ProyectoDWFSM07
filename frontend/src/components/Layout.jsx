import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.user?.role || user?.role || "-";
  const name = user?.user?.name || user?.name || "Usuario";

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/certifications">
            Certificaciones
          </Link>

          <div className="d-flex align-items-center gap-2 text-white">
            <small className="text-secondary">
              {name} · {role}
            </small>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container my-4">{children}</main>
    </>
  );
}
