import { Link, NavLink } from "react-router-dom";
import logo from "/logo.svg";

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
              <span className="fw-bold ds-text-primary">
                CERTIFY
              </span>
            </div>
          </div>

          {/* Links centrados */}
          <div className="col-12 col-md-4 mb-3 mb-md-0">
            <div className="d-flex justify-content-center gap-4">
              
              <NavLink
                to="/"
                className="text-decoration-none fw-semibold ds-text-primary"
              >
                Inicio
              </NavLink>

              <NavLink
                to="/catalog"
                className="text-decoration-none fw-semibold ds-text-primary"
              >
                Catálogo
              </NavLink>

              <NavLink
                to="/help"
                className="text-decoration-none fw-semibold ds-text-primary"
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
                className="btn ds-btn-primary"
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
