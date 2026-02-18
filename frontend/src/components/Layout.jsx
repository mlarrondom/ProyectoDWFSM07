import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "/logo.svg"; // public
import Footer from "./Footer";
import CartIcon from "./CartIcon";

const INTERNAL_ROLES = ["admin", "sede_santiago", "sede_concepcion"];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.user?.role || user?.role || "-";
  const name = user?.user?.name || user?.name || "Usuario";
  const isLogged = !!user;
  const isInternalUser = INTERNAL_ROLES.includes(role);

  const [openMaintainers, setOpenMaintainers] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const userMenuRef = useRef(null);

  const handleLogout = () => {
    setOpenMaintainers(false);
    setOpenUserMenu(false);
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    setOpenMaintainers(false);
    setOpenUserMenu(false);
  }, [location.pathname]);

  return (
    <>
      <nav className="ds-nav">
        <div className="container-fluid ds-nav-inner">
          {/* Brand */}
          <Link to="/" className="ds-brand">
            <img src={logo} alt="Certify Logo" style={{ height: "40px" }} />
          </Link>

          {/* Menú */}
          <div className="ds-nav-links">
            <NavLink to="/" className={({ isActive }) => `ds-navlink ${isActive ? "is-active" : ""}`}>
              Inicio
            </NavLink>

            <NavLink to="/catalog" className={({ isActive }) => `ds-navlink ${isActive ? "is-active" : ""}`}>
              Catálogo
            </NavLink>

            <NavLink to="/help" className={({ isActive }) => `ds-navlink ${isActive ? "is-active" : ""}`}>
              Ayuda
            </NavLink>

            <CartIcon />

            {/* Mantenedores SOLO internos */}
            {isLogged && isInternalUser && (
              <div className="ds-dropdown">
                <button
                  type="button"
                  className="ds-navlink ds-trigger"
                  onClick={() => setOpenMaintainers((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Mantenedores <i className="bi bi-chevron-down ms-2"></i>
                </button>

                {openMaintainers && (
                  <div className="ds-menu ds-menu-right">
                    <NavLink to="/admin/courses" onClick={() => setOpenMaintainers(false)} className="ds-menu-item">
                      Cursos
                    </NavLink>

                    <NavLink
                      to="/admin/certifications"
                      onClick={() => setOpenMaintainers(false)}
                      className="ds-menu-item"
                    >
                      Certificaciones
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {/* Sesión (chip + dropdown) */}
            {!isLogged ? (
              <NavLink to="/login" className="ds-chip-link d-flex align-items-center justify-content-between">
                Ingresar <i className="bi bi-box-arrow-in-right ms-2"></i>
              </NavLink>
            ) : (
              <div className="ds-dropdown" ref={userMenuRef}>
                <button
                  type="button"
                  className="ds-userchip"
                  onClick={() => setOpenUserMenu((v) => !v)}
                  title={name}
                >
                  <i className="bi bi-person"></i>
                  <span className="ds-userchip-text">{name}</span>
                  <i className="bi bi-chevron-down"></i>
                </button>

                {openUserMenu && (
                  <div className="ds-menu ds-menu-right">
                    <div className="ds-menu-header">
                      <div className="ds-menu-name">{name}</div>
                      <div className="ds-menu-role">Rol: {role}</div>
                    </div>

                    <div className="ds-menu-sep" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="ds-menu-danger d-flex align-items-center justify-content-between"
                    >
                      Cerrar sesión <i className="bi bi-box-arrow-right"></i>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container-xxl my-4">{children}</main>

      {/* Footer global */}
      <Footer />
    </>
  );
}
