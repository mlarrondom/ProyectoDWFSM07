import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

export default function Catalog() {
  const [certifications, setCertifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ filtro binario por sede
  const [campus, setCampus] = useState("Santiago");

  const load = async () => {
    setError("");
    setLoading(true);

    try {
      // ✅ público: sin token
      const res = await fetch(`${API}/api/certifications`);
      const data = await res.json();

      if (!res.ok) {
        setError(data?.msg || "Error cargando certificaciones");
        setCertifications([]);
        return;
      }

      setCertifications(data?.certifications || []);
    } catch {
      setError("Error de conexión");
      setCertifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return certifications
      .filter((c) => c.campus === campus)
      .sort((a, b) => (a.certCode || 0) - (b.certCode || 0));
  }, [certifications, campus]);

  // ✅ agrupar por área (ownerUnit)
  const groupedByArea = useMemo(() => {
    const acc = {};
    for (const c of filtered) {
      const key = c.ownerUnit || "Sin área";
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
    }
    return acc;
  }, [filtered]);

  const areaEntries = useMemo(() => {
    // orden alfabético de áreas
    return Object.entries(groupedByArea).sort(([a], [b]) => a.localeCompare(b));
  }, [groupedByArea]);

  const formatCLP = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "-";
    return n.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="ds-page">
      {/* Header + filtro binario */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h2 className="m-0">Catálogo de Certificaciones</h2>
          <div className="text-muted" style={{ fontSize: 14 }}>
            Selecciona sede para ver la oferta disponible.
          </div>
        </div>

        <div className="btn-group" role="group" aria-label="Filtro por sede">
          <button
            type="button"
            className={`btn ${campus === "Santiago" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setCampus("Santiago")}
            style={{ fontWeight: 800 }}
          >
            Santiago
          </button>
          <button
            type="button"
            className={`btn ${campus === "Concepción" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setCampus("Concepción")}
            style={{ fontWeight: 800 }}
          >
            Concepción
          </button>
        </div>
      </div>

      {loading && <div className="alert alert-info">Cargando catálogo...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="alert alert-secondary mb-0">
          No hay certificaciones disponibles para <b>{campus}</b>.
        </div>
      )}

      {/* Agrupado por Área */}
      <div className="d-flex flex-column gap-4">
        {areaEntries.map(([area, certs]) => (
          <section key={area}>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h5 className="m-0" style={{ fontWeight: 900 }}>
                {area}
              </h5>
              <small className="text-muted">
                {certs.length} {certs.length === 1 ? "certificación" : "certificaciones"}
              </small>
            </div>

            <div className="row g-3">
              {certs.map((cert) => (
                <div className="col-12 col-md-6 col-lg-4" key={cert.certCode}>
                  <div className="card ds-card h-100">
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start gap-2">
                        <h6 className="card-title m-0" style={{ fontWeight: 900 }}>
                          {cert.name}
                        </h6>
                        <span
                          className="badge text-bg-light"
                          style={{ border: "1px solid #e5e7eb" }}
                          title="Código certificación"
                        >
                          {cert.certCode}
                        </span>
                      </div>

                      <div className="mt-2 text-muted" style={{ fontSize: 14 }}>
                        <div>
                          <b>Sede:</b> {cert.campus}
                        </div>
                        <div>
                          <b>Precio:</b> {formatCLP(cert.price ?? 0)}
                        </div>
                      </div>

                      <div className="mt-auto pt-3 d-flex gap-2">
                        {/* Si ya tienes una página pública de detalle, mantenemos el link */}
                        <Link
                          className="btn btn-outline-primary"
                          to={`/certifications/${cert.certCode}`}
                        >
                          Ver detalle
                        </Link>

                        {/* Para el carro de compra lo conectamos después */}
                        <button className="btn btn-primary" type="button">
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
