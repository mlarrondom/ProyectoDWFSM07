import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClientAuth } from '../context/ClientAuthContext';
import logo from '/logo.svg';
import Footer from './Footer';
import CartIcon from './CartIcon';

const INTERNAL_ROLES = ['admin', 'sede_santiago', 'sede_concepcion'];

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { client, clientToken, clientLogout } = useClientAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const role = user?.user?.role || user?.role || '-';
    const name = user?.user?.name || user?.name || 'Usuario';
    const isAdminLogged = !!user;
    const isInternalUser = INTERNAL_ROLES.includes(role);

    const clientName = client?.fullName || 'Cliente';
    const isClientLogged = !!clientToken;

    const [openMaintainers, setOpenMaintainers] = useState(false);
    const [openUserMenu, setOpenUserMenu] = useState(false);

    const userMenuRef = useRef(null);

    const handleLogout = () => {
        setOpenMaintainers(false);
        setOpenUserMenu(false);

        if (isAdminLogged) {
            logout();
            navigate('/login');
            return;
        }

        if (isClientLogged) {
            clientLogout();
            navigate('/client/login');
        }
    };

    useEffect(() => {
        const onClickOutside = (e) => {
            if (!userMenuRef.current) return;
            if (!userMenuRef.current.contains(e.target)) setOpenUserMenu(false);
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    useEffect(() => {
        setOpenMaintainers(false);
        setOpenUserMenu(false);
    }, [location.pathname]);

    return (
        <div className="ds-layout">
            <nav className="ds-nav">
                <div className="container-fluid ds-nav-inner">
                    <Link to="/" className="ds-brand">
                        <img src={logo} alt="Certify Logo" style={{ height: '40px' }} />
                    </Link>

                    <div className="ds-nav-links">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `ds-navlink ${isActive ? 'is-active' : ''}`
                            }
                        >
                            Inicio
                        </NavLink>

                        <NavLink
                            to="/catalog"
                            className={({ isActive }) =>
                                `ds-navlink ${isActive ? 'is-active' : ''}`
                            }
                        >
                            Catálogo
                        </NavLink>

                        <NavLink
                            to="/help"
                            className={({ isActive }) =>
                                `ds-navlink ${isActive ? 'is-active' : ''}`
                            }
                        >
                            Ayuda
                        </NavLink>

                        {isAdminLogged && isInternalUser && (
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
                                        <NavLink
                                            to="/admin/courses"
                                            onClick={() => setOpenMaintainers(false)}
                                            className="ds-menu-item"
                                        >
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

                        {/* ✅ Bloque derecho: carrito + sesión */}
                        <div className="d-inline-flex align-items-center gap-2 ms-auto">
                            <CartIcon />

                            {!isAdminLogged && !isClientLogged ? (
                                <>
                                    <NavLink
                                        to="/signup"
                                        className="ds-chip-outline ds-chip-hover d-flex align-items-center justify-content-between"
                                    >
                                        Registrarme <i className="bi bi-person-plus ms-2"></i>
                                    </NavLink>

                                    {/* Ingresar principal (derecha) */}
                                    <NavLink
                                        to="/client/login"
                                        className="ds-chip-link ds-chip-hover d-flex align-items-center justify-content-between"
                                    >
                                        Ingresar <i className="bi bi-box-arrow-in-right ms-2"></i>
                                    </NavLink>
                                </>
                            ) : (
                                <div className="ds-dropdown" ref={userMenuRef}>
                                    <button
                                        type="button"
                                        className="ds-userchip"
                                        onClick={() => setOpenUserMenu((v) => !v)}
                                        title={isAdminLogged ? name : clientName}
                                    >
                                        <i className="bi bi-person"></i>
                                        <span className="ds-userchip-text">
                                            {isAdminLogged ? name : clientName}
                                        </span>
                                        <i className="bi bi-chevron-down"></i>
                                    </button>

                                    {openUserMenu && (
                                        <div className="ds-menu ds-menu-right">
                                            <div className="ds-menu-header">
                                                <div className="ds-menu-name">
                                                    {isAdminLogged ? name : clientName}
                                                </div>
                                                <div className="ds-menu-role">
                                                    {isAdminLogged ? `Rol: ${role}` : 'Cliente'}
                                                </div>
                                            </div>

                                            <div className="ds-menu-sep" />

                                            {!isAdminLogged && (
                                                <NavLink
                                                    to="/me"
                                                    onClick={() => setOpenUserMenu(false)}
                                                    className="ds-menu-item"
                                                >
                                                    Mi perfil
                                                </NavLink>
                                            )}

                                            {!isAdminLogged && <div className="ds-menu-sep" />}

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="ds-menu-danger d-flex align-items-center justify-content-between"
                                            >
                                                Cerrar sesión{' '}
                                                <i className="bi bi-box-arrow-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="ds-content container-xxl my-4">{children}</main>

            <Footer />
        </div>
    );
}
