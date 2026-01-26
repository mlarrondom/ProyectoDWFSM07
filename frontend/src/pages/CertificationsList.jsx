import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CertificationsDetail from "./CertificationsDetail"; // <-- ajusta ruta si corresponde

export default function CertificationsList() {
  const API = import.meta.env.VITE_API_URL;
  const { token, user } = useAuth();
  const role = user?.role || user?.user?.role || "-";

  const [certifications, setCertifications] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgOk, setMsgOk] = useState("");

  // Crear
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newCert, setNewCert] = useState({
    certCode: "",
    name: "",
    campus: "Santiago",
    ownerUnit: "",
  });

  // Ver (solo certCode)
  const [selectedCertCode, setSelectedCertCode] = useState(null);

  // ========= Helpers UI (mantengo tu modal actual) =========
  const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  };

  const modalCardStyle = {
    width: "100%",
    maxWidth: 900,
    background: "white",
    borderRadius: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  };

  const modalHeaderStyle = {
    padding: "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #e5e7eb",
    background: "#ffffff",
  };

  const closeBtnStyle = {
    width: 40,
    height: 40,
    borderRadius: 12,
    border: "1px solid #d0d5dd",
    background: "white",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    lineHeight: 1,
  };

  const inputStyle = {
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid #d0d5dd",
  };

  const selectStyle = {
    borderRadius: 10,
    padding: "10px 12px",
    border: "1px solid #d0d5dd",
    backgroundColor: "#fff",
  };

  const footerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22,
  };

  const primaryBtnStyle = {
    borderRadius: 10,
    padding: "10px 18px",
    background: "#006699",
    color: "white",
    fontWeight: 800,
    border: "none",
  };

  const ctaBtnStyle = {
    borderRadius: 10,
    padding: "10px 18px",
    background: "#FF6600",
    color: "white",
    fontWeight: 800,
    border: "none",
  };

  // ========= Data =========
  const fetchCerts = async () => {
    try {
      setLoading(true);
      setMsgError("");
      setMsgOk("");

      const res = await fetch(`${API}/api/certifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "No se pudieron cargar certificaciones");

      setCertifications(data?.certifications || []);
    } catch (err) {
      setMsgError(err.message || "Error al cargar certificaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = filterName.trim().toLowerCase();
    if (!q) return certifications;

    return certifications.filter((c) =>
      String(c.name ?? "").toLowerCase().includes(q)
    );
  }, [certifications, filterName]);

  // ========= Modals =========
  const openViewModal = (certCode) => {
    setMsgError("");
    setMsgOk("");
    setSelectedCertCode(certCode);
  };

  const closeViewModal = () => setSelectedCertCode(null);

  const openCreateModal = () => {
    setMsgError("");
    setMsgOk("");
    setNewCert({
      certCode: "",
      name: "",
      campus: "Santiago",
      ownerUnit: "",
    });
    setOpenCreate(true);
  };

  const closeCreateModal = () => setOpenCreate(false);

  // ========= POST create =========
  const handleCreateCertification = async (e) => {
    e.preventDefault();
    setMsgError("");
    setMsgOk("");

    try {
      setCreating(true);

      const payload = {
        certCode: Number(newCert.certCode),
        name: String(newCert.name).trim(),
        campus: String(newCert.campus).trim() || undefined,
        ownerUnit: String(newCert.ownerUnit).trim() || undefined,
      };

      if (!payload.certCode || !payload.name) {
        setMsgError("Completa Código y Nombre.");
        return;
      }

      const res = await fetch(`${API}/api/certifications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error al crear certificación");

      setMsgOk("Certificación creada.");
      setOpenCreate(false);
      await fetchCerts();
    } catch (err) {
      setMsgError(err.message || "Error al crear certificación");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="py-2">
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h2 className="m-0" style={{ color: "#006699" }}>
            Certificaciones - Mantenedor
          </h2>
          <small className="text-muted">Rol: {role}</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control"
            style={{ maxWidth: 360, borderRadius: 10, padding: "10px 12px" }}
            placeholder="Filtrar por nombre..."
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
          />

          <button style={ctaBtnStyle} onClick={openCreateModal}>
            Agregar
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {msgError && <div className="alert alert-danger">{msgError}</div>}
      {msgOk && <div className="alert alert-success">{msgOk}</div>}

      {/* Tabla */}
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
            <table className="table table-hover align-middle w-100">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 140 }}>Código</th>
                  <th>Nombre</th>
                  <th style={{ width: 180 }}>Campus</th>
                  <th className="text-end" style={{ width: 120 }}>
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id || c.certCode}>
                    <td>
                      <strong>{c.certCode}</strong>
                    </td>

                    <td style={{ color: "#006699", fontWeight: 700 }}>
                      {c.name}
                    </td>

                    <td>{c.campus || "-"}</td>

                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        style={{ borderRadius: 10 }}
                        onClick={() => openViewModal(c.certCode)}
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

      {/* ===== MODAL CREAR ===== */}
      {openCreate && (
        <div onClick={closeCreateModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <h5 style={{ margin: 0, fontWeight: 900 }}>Nueva Certificación</h5>

              <button
                type="button"
                onClick={closeCreateModal}
                style={closeBtnStyle}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCertification} style={{ padding: 22 }}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label style={{ color: "#667085", fontSize: 13, fontWeight: 600 }}>
                    Código
                  </label>
                  <input
                    className="form-control"
                    style={inputStyle}
                    placeholder="Ej: 2001"
                    value={newCert.certCode}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, certCode: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-9">
                  <label style={{ color: "#667085", fontSize: 13, fontWeight: 600 }}>
                    Nombre
                  </label>
                  <input
                    className="form-control"
                    style={inputStyle}
                    placeholder="Nombre de la certificación"
                    value={newCert.name}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label style={{ color: "#667085", fontSize: 13, fontWeight: 600 }}>
                    Campus
                  </label>
                  <select
                    className="form-select"
                    style={selectStyle}
                    value={newCert.campus}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, campus: e.target.value }))
                    }
                  >
                    <option value="Santiago">Santiago</option>
                    <option value="Concepción">Concepción</option>
                  </select>
                </div>

                <div className="col-md-8">
                  <label style={{ color: "#667085", fontSize: 13, fontWeight: 600 }}>
                    Unidad
                  </label>
                  <input
                    className="form-control"
                    style={inputStyle}
                    placeholder="Facultad / Unidad"
                    value={newCert.ownerUnit}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, ownerUnit: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div style={footerStyle}>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="btn btn-outline-secondary"
                  style={{ borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}
                >
                  Cancelar
                </button>

                <button type="submit" style={primaryBtnStyle} disabled={creating}>
                  {creating ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL VER ===== */}
      {selectedCertCode && (
        <div onClick={closeViewModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalCardStyle}>
            <div style={modalHeaderStyle}>
              <h5 style={{ margin: 0, fontWeight: 900 }}>
                Certificación {selectedCertCode}
              </h5>

              <button
                type="button"
                onClick={closeViewModal}
                style={closeBtnStyle}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 22 }}>
              <CertificationsDetail
                certCode={selectedCertCode}
                onUpdated={fetchCerts}
              />
            </div>

            <div
              style={{
                padding: 18,
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                background: "#ffffff",
              }}
            >
              <button
                type="button"
                onClick={closeViewModal}
                className="btn btn-outline-secondary"
                style={{ borderRadius: 10, padding: "10px 18px", fontWeight: 700 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
