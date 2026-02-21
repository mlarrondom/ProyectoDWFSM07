import { Link, NavLink } from 'react-router-dom';
import logo from '/logo.svg';

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-white border-top mt-5">
            <div className="container-xxl py-4">
                {/* Fila principal */}
                <div className="row align-items-center text-center text-md-start">
                    {/* Logo izquierda */}
                    <div className="col-12 col-md-4 mb-3 mb-md-0">
                        <div className="d-flex justify-content-center justify-content-md-start align-items-center gap-2">
                            <img src={logo} alt="CERTIFY" style={{ height: 38 }} />
                        </div>
                    </div>

                    {/* Links centrados */}
                    <div className="col-12 col-md-4 mb-3 mb-md-0">
                        <div className="d-flex justify-content-center gap-4">
                            <NavLink
                                to="/"
                                className="text-decoration-none fw-semibold ds-footer-link"
                            >
                                Inicio
                            </NavLink>

                            <NavLink
                                to="/catalog"
                                className="text-decoration-none fw-semibold ds-footer-link"
                            >
                                Catálogo
                            </NavLink>

                            <NavLink
                                to="/help"
                                className="text-decoration-none fw-semibold ds-footer-link"
                            >
                                Ayuda
                            </NavLink>
                        </div>
                    </div>

                    {/* Contacto derecha */}
                    <div className="col-12 col-md-4">
                        <div className="d-flex justify-content-center justify-content-md-end">
                            <Link
                                to="/help"
                                className="btn btn-outline-secondary"
                                style={{ borderRadius: 8 }}
                            >
                                Contáctanos <i className="bi bi-envelope ms-2"></i>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <hr className="my-4" />

                {/* Derechos reservados */}
                <div className="text-center ds-text-secondary">
                    © {year} CERTIFY · Todos los derechos reservados
                </div>
            </div>
        </footer>
    );
}
