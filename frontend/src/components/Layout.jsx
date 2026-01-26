import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const INTERNAL_ROLES = ["admin", "sede_santiago", "sede_concepcion"];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.user?.role || user?.role || "-";
  const name = user?.user?.name || user?.name || "Usuario";
  const isLogged = !!user;
  const isInternalUser = INTERNAL_ROLES.includes(role);

  // ✅ Admin pages: full width
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [openMaintainers, setOpenMaintainers] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const userMenuRef = useRef(null);

  const handleLogout = () => {
    setOpenMaintainers(false);
    setOpenUserMenu(false);
    logout();
    navigate("/login");
  };

  // cerrar dropdown usuario al click fuera
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Cierra dropdown mantenedores cuando cambias de ruta
  useEffect(() => {
    setOpenMaintainers(false);
    setOpenUserMenu(false);
  }, [location.pathname]);

  const navLinkStyle = ({ isActive }) => ({
    color: "#333333",
    textDecoration: "none",
    fontWeight: isActive ? 700 : 500,
    padding: "10px 10px",
    borderRadius: 8,
    background: isActive ? "rgba(0, 102, 153, 0.08)" : "transparent",
    display: "inline-block",
    lineHeight: 1.2,
  });

  // Trigger tipo link (para dropdown mantenedores)
  const linkLikeTriggerStyle = {
    color: "#333333",
    textDecoration: "none",
    fontWeight: 500,
    padding: "10px 10px",
    borderRadius: 8,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    lineHeight: 1.2,
  };

  // Chip usuario compacto
  const userChipStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "7px 12px",
    borderRadius: 999,
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    fontWeight: 600,
    color: "#333333",
    fontSize: 14,
    maxWidth: 170,
  };

  return (
    <>
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        {/* ✅ FIX: container-fluid (antes estaba "container fluid") */}
        <div className="container-fluid d-flex align-items-center justify-content-between py-2">
          {/* Brand */}
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#006699",
              fontWeight: 800,
              fontFamily: "Ubuntu, system-ui, -apple-system, Segoe UI, Arial",
              marginRight: 10,
            }}
          >
            Proyecto M07
          </Link>

          {/* Menú */}
          <div className="d-flex align-items-center gap-2">
            <NavLink to="/" style={navLinkStyle}>
              Inicio
            </NavLink>

            <NavLink to="/catalog" style={navLinkStyle}>
              Catálogo
            </NavLink>

            <NavLink to="/help" style={navLinkStyle}>
              Ayuda
            </NavLink>

            {/* Mantenedores SOLO internos */}
            {isLogged && isInternalUser && (
              <div className="position-relative">
                <button
                  type="button"
                  style={linkLikeTriggerStyle}
                  onClick={() => setOpenMaintainers((v) => !v)}
                  onMouseDown={(e) => e.preventDefault()}
                >
                  Mantenedores ▾
                </button>

                {openMaintainers && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border"
                    style={{
                      minWidth: 220,
                      borderRadius: 8,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      zIndex: 9999,
                    }}
                  >
                    <NavLink
                      to="/admin/courses"
                      onClick={() => setOpenMaintainers(false)}
                      style={{
                        display: "block",
                        padding: "10px 12px",
                        textDecoration: "none",
                        color: "#333333",
                      }}
                    >
                      Cursos
                    </NavLink>

                    <NavLink
                      to="/admin/certifications"
                      onClick={() => setOpenMaintainers(false)}
                      style={{
                        display: "block",
                        padding: "10px 12px",
                        textDecoration: "none",
                        color: "#333333",
                      }}
                    >
                      Certificaciones
                    </NavLink>
                  </div>
                )}
              </div>
            )}

            {/* Sesión (chip + dropdown) */}
            {!isLogged ? (
              <NavLink
                to="/login"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "7px 12px",
                  borderRadius: 999,
                  border: "1px solid #d0d5dd",
                  textDecoration: "none",
                  color: "#006699",
                  fontWeight: 700,
                  background: "#ffffff",
                }}
              >
                👤 Ingresar
              </NavLink>
            ) : (
              <div className="position-relative" ref={userMenuRef}>
                <div
                  style={userChipStyle}
                  onClick={() => setOpenUserMenu((v) => !v)}
                  title={name}
                >
                  <span>👤</span>
                  <span
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </span>
                  <span style={{ fontWeight: 700, color: "#006699" }}>▾</span>
                </div>

                {openUserMenu && (
                  <div
                    className="position-absolute end-0 mt-2 bg-white border"
                    style={{
                      minWidth: 240,
                      borderRadius: 8,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      zIndex: 9999,
                    }}
                  >
                    <div style={{ padding: 12 }}>
                      <div style={{ fontWeight: 800, color: "#333333" }}>
                        {name}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Rol: {role}
                      </div>
                    </div>

                    <div style={{ borderTop: "1px solid #e5e7eb" }} />

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        background: "transparent",
                        color: "#b42318",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ⎋ Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="container-xxl my-4">{children}</main>
    </>
  );
}
