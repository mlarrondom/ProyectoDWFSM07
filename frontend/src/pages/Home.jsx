import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home-page">
      {/* HERO full width */}
      <section className="home-hero">
        <div className="container-xxl py-5">
          <div className="row align-items-center g-5 py-4 py-lg-5">
            {/* copy */}
            <div className="col-12 col-lg-6">
              <div className="home-kicker mb-3">
                CERTIFY · Certificaciones Académicas
              </div>

              <h1 className="home-title mb-4">
                Elige tu certificación.
                <br />
                Revisa requisitos.
                <br />
                Compra con confianza.
              </h1>

              <p className="home-lead mb-4">
                CERTIFY te permite explorar certificaciones que agrupan cursos y
                requisitos, con una experiencia moderna, transparente y lista para decidir rápido.
              </p>

              <div className="home-badges mt-4">
                <div className="home-badge">
                  <i className="bi bi-check-circle"></i>
                  Catálogo público (sin registro)
                </div>
                <div className="home-badge">
                  <i className="bi bi-check-circle"></i>
                  Requisitos visibles en el detalle
                </div>
                <div className="home-badge">
                  <i className="bi bi-geo-alt"></i>
                  Sedes: Santiago y Concepción
                </div>
              </div>
            </div>

            {/* visual card */}
            <div className="col-12 col-lg-6">
              <div className="home-hero-card ds-card p-4 p-md-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div className="home-card-title">
                    Lo más importante, a primera vista
                  </div>
                  <i className="bi bi-stars home-card-icon"></i>
                </div>

                  <div className="home-step">
                    <div className="home-step-dot">1</div>
                    <div>
                      <div className="home-step-title">Elige tu sede</div>
                      <div className="home-step-text">
                        Santiago o Concepción, según disponibilidad.
                      </div>
                    </div>
                  </div>
                <div className="home-steps">
                  <div className="home-step">
                    <div className="home-step-dot">2</div>
                    <div>
                      <div className="home-step-title">Explora por unidad</div>
                      <div className="home-step-text">
                        Navega certificaciones organizadas para encontrar rápido.
                      </div>
                    </div>
                  </div>

                  <div className="home-step">
                    <div className="home-step-dot">3</div>
                    <div>
                      <div className="home-step-title">Revisa requisitos</div>
                      <div className="home-step-text">
                        Créditos, cursos y condiciones en la ficha.
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-4">
<Link
  to="/catalog"
  className="btn btn-cta d-inline-flex align-items-center gap-2 px-4"
>
  Ver certificaciones
  <i className="bi bi-arrow-right"></i>
</Link>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MÁS VENDIDOS */}
      <section className="py-5">
        <div className="container-xxl py-3 py-lg-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-end gap-3 mb-4">
            <div>
              <h2 className="home-section-title mb-2">Más vendidos</h2>
              <p className="home-section-subtitle mb-0">
                Lo que más buscan hoy en día.
              </p>
            </div>

            <Link to="/catalog" className="btn ds-btn-secondary">
              Ver más <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>

          {/* cards (placeholder visual; luego lo conectamos al catálogo si quieres) */}
          <div className="row g-4">
            {[
              {
                title: "Programación Web Frontend",
                unit: "Tecnología / TI",
                desc: "Certificación orientada a bases sólidas para desarrollo web moderno.",
              },
              {
                title: "Data & Analítica Aplicada",
                unit: "Negocios / Datos",
                desc: "Enfoque práctico para análisis y toma de decisiones con datos.",
              },
              {
                title: "Gestión de Proyectos",
                unit: "Gestión / Liderazgo",
                desc: "Herramientas y metodologías para ejecutar proyectos con éxito.",
              },
            ].map((item, idx) => (
              <div className="col-12 col-md-6 col-lg-4" key={idx}>
                <div className="ds-card p-4 h-100 home-product-card">
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div>
                      <div className="home-pill">{item.unit}</div>
                      <h5 className="mt-3 mb-2">{item.title}</h5>
                    </div>
                    <i className="bi bi-award home-award"></i>
                  </div>

                  <p className="home-card-desc mt-2 mb-4">{item.desc}</p>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOQUE DE CONFIANZA / VALOR */}
      <section className="py-5 home-value">
        <div className="container-xxl py-4">
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="ds-card p-4 h-100">
                <i className="bi bi-journal-check home-icon mb-3"></i>
                <h5>Requisitos claros</h5>
                <p className="home-muted mb-0">
                  Cada certificación muestra sus cursos y reglas asociadas.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="ds-card p-4 h-100">
                <i className="bi bi-lightning-charge home-icon mb-3"></i>
                <h5>Navegación rápida</h5>
                <p className="home-muted mb-0">
                  Catálogo público con lectura simple y enfoque comercial.
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div className="ds-card p-4 h-100">
                <i className="bi bi-geo-alt home-icon mb-3"></i>
                <h5>Dos sedes</h5>
                <p className="home-muted mb-0">
                  Santiago y Concepción para adaptarse a tus necesidades.
                </p>
              </div>
            </div>
          </div>

          {/* CTA final */}
          <div className="ds-card p-4 p-md-5 mt-4 home-final-cta">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
              <div>
                <div className="home-final-title">
                  ¿Listo para elegir tu próxima certificación?
                </div>
                <div className="home-muted">
                  Revisa el catálogo, entra al detalle y decide con información completa.
                </div>
              </div>

              <div className="d-flex flex-column flex-sm-row gap-2">
                <Link to="/catalog" className="btn ds-btn-primary btn-lg px-4">
                  Ir al catálogo <i className="bi bi-arrow-right ms-2"></i>
                </Link>
                <Link to="/help" className="btn ds-btn-secondary btn-lg px-4">
                  Tengo dudas <i className="bi bi-question-circle ms-2"></i>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
