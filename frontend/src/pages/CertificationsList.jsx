import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CertificationsList() {
  const API = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();

  const role = user?.role || user?.user?.role || "-";

  const [certifications, setCertifications] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgError, setMsgError] = useState("");

  // Modal (ver)
  const [selectedCert, setSelectedCert] = useState(null);

  // ====== GET al cargar ======
  useEffect(() => {
    if (!token) return;

    const fetchCerts = async () => {
      try {
        setLoading(true);
        setMsgError("");

        const res = await fetch(`${API}/api/certifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.msg || "No se pudieron cargar certificaciones");
        }

        setCertifications(data?.certifications || []);
      } catch (err) {
        setMsgError(err.message || "Error al cargar certificaciones");
      } finally {
        setLoading(false);
      }
    };

    fetchCerts();
  }, [API, token]);

  // ====== Filtro por nombre ======
  const filtered = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    if (!q) return certifications;

    return certifications.filter((c) =>
      String(c.name ?? "").toLowerCase().includes(q)
    );
  }, [certifications, filterName]);

  // ====== Abrir modal ======
  const openViewModal = (cert) => {
    setSelectedCert(cert);
  };

  const closeModal = () => setSelectedCert(null);

  return (
    <div className="container py-2">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h2 className="m-0" style={{ color: "#006699" }}>
            Certificaciones (Admin)
          </h2>
          <small className="text-muted">Rol: {role}</small>
        </div>

        <input
          className="form-control"
          style={{ maxWidth: 360, borderRadius: 8 }}
          placeholder="Filtrar por nombre..."
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />
      </div>

      {msgError && <div className="alert alert-danger">{msgError}</div>}

      {loading ? (
        <div className="alert alert-info">Cargando certificaciones...</div>
      ) : (
        <>
          <div className="mb-2 text-muted">
            Mostrando <b>{filtered.length}</b> de <b>{certifications.length}</b>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-secondary">
              No hay certificaciones para mostrar.
            </div>
          ) : (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Campus</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id || c.certCode}>
                    <td>
                      <strong>{c.certCode}</strong>
                    </td>

                    <td style={{ color: "#006699", fontWeight: 600 }}>
                      {c.name}
                    </td>

                    <td>{c.campus || "-"}</td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openViewModal(c)}
                        title="Ver certificación"
                      >
                        👁
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ===== MODAL (overlay simple) ===== */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 720,
              background: "white",
              borderRadius: 8,
              boxShadow: "0 16px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 16,
                background: "#006699",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontWeight: 700 }}>
                Certificación {selectedCert.certCode}
              </div>
              <button className="btn btn-sm btn-light" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <div className="mb-2">
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Nombre
                </div>
                <div style={{ fontWeight: 700 }}>{selectedCert.name}</div>
              </div>

              <div className="row g-2">
                <div className="col-6">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Campus
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedCert.campus || "-"}
                  </div>
                </div>

                <div className="col-6">
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    Unidad
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {selectedCert.ownerUnit || "-"}
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => alert("Siguiente paso: editar info general")}
                >
                  ✏️ Editar información
                </button>

                <button
                  className="btn btn-outline-secondary"
                  onClick={() => alert("Siguiente paso: editar requerimientos")}
                >
                  📋 Editar requerimientos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
