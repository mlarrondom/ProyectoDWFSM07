import { useState } from "react";
import { Link } from "react-router-dom";

export default function Help() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    alert("Mensaje enviado (demo visual)");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="help-page">
      {/* HERO */}
      <section className="help-hero">
        <div className="container-xxl py-5">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-7">
              <div className="help-kicker mb-3">Centro de Ayuda</div>

              <h1 className="help-title mb-3">
                Resuelve tus dudas antes de elegir tu certificación.
              </h1>

              <p className="help-lead mb-4">
                Revisa requisitos, sedes y detalles con claridad. Aquí
                respondemos lo más importante para que tomes una decisión
                informada.
              </p>
            </div>

            <div className="col-12 col-lg-5">
              <div className="help-side-card p-4">
                <h5 className="mb-3">¿Qué puedes hacer aquí?</h5>

                <ul className="help-side-list">
                  <li>Entender qué incluye una certificación</li>
                  <li>Revisar requisitos y condiciones</li>
                  <li>Confirmar sedes disponibles</li>
                </ul>

                <Link to="/catalog" className="btn btn-cta w-100 mt-3">
                  Ver certificaciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-5">
        <div className="container-xxl">
          <div className="text-center mb-5">
            <h2 className="help-section-title">Preguntas frecuentes</h2>
            <p className="help-section-subtitle">Respuestas claras y directas.</p>
          </div>

          <div className="row g-4">
            {[
              {
                q: "¿Qué estoy comprando?",
                a: "Una certificación académica que agrupa cursos y requisitos.",
              },
              {
                q: "¿Dónde veo los requisitos?",
                a: "En el detalle de cada certificación dentro del catálogo.",
              },
              {
                q: "¿Qué sedes están disponibles?",
                a: "Santiago y Concepción.",
              },
              {
                q: "¿Necesito registrarme?",
                a: "No. El catálogo es público.",
              },
            ].map((item, idx) => (
              <div className="col-12 col-lg-6" key={idx}>
                <div className="help-faq-card p-4">
                  <h5>{item.q}</h5>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contact" className="py-5 help-contact">
        <div className="container-xxl">
          <div className="help-form-card p-4 p-md-5">
            <h3 className="mb-4">Formulario de contacto</h3>

            <form onSubmit={onSubmit} className="row g-3">
              <div className="col-12 col-md-6">
                <input
                  type="text"
                  name="name"
                  className="form-control help-input"
                  placeholder="Nombre"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <input
                  type="email"
                  name="email"
                  className="form-control help-input"
                  placeholder="Email"
                  value={form.email}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="col-12">
                <textarea
                  name="message"
                  rows="4"
                  className="form-control help-input"
                  placeholder="Mensaje"
                  value={form.message}
                  onChange={onChange}
                  required
                />
              </div>

              <div className="col-12 d-flex justify-content-end">
                <button type="submit" className="btn btn-cta">
                  Enviar mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
