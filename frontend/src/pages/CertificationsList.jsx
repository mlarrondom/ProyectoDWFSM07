import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CertificationsDetail from "./CertificationsDetail"; // ajusta ruta si corresponde

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
      if (!res.ok)
        throw new Error(data?.msg || "No se pudieron cargar certificaciones");

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
      String(c.name ?? "")
        .toLowerCase()
        .includes(q),
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
    <div className="container py-2 ds-table-page">
      {/* Header */}
      <div className="ds-card certs-toolbar">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h2 className="m-0 certs-title">Certificaciones - Mantenedor</h2>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control ds-filter-input"
              placeholder="Filtrar por nombre..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />

            <button className="btn btn-cta d-flex align-items-center justify-content-between" onClick={openCreateModal}>
              Agregar
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {msgError && <div className="alert alert-danger mt-3">{msgError}</div>}
      {msgOk && <div className="alert alert-success mt-3">{msgOk}</div>}

      {/* Tabla */}
      {loading ? (
        <div className="alert alert-info mt-3">Cargando certificaciones...</div>
      ) : (
        <>
          <div className="mb-2 text-muted mt-3">
            Mostrando <b>{filtered.length}</b> de <b>{certifications.length}</b>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-secondary">
              No hay certificaciones para mostrar.
            </div>
          ) : (
            <div className="ds-card certs-table-card">
              <table className="table table-hover align-middle w-100 m-0">
                <thead className="table-light">
                  <tr>
                    <th className="certs-col-code text-center">Código</th>
                    <th className="text-center">Nombre</th>
                    <th className="certs-col-campus text-center">Campus</th>
                    <th className="text-end certs-col-actions text-center">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id || c.certCode}>
                      <td className="text-center">
                        <strong>{c.certCode}</strong>
                      </td>

                      <td className="certs-name">{c.name}</td>

                      <td className="text-center">{c.campus || "-"}</td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-link btn-icon d-inline-flex align-items-center justify-content-center"
                          onClick={() => openViewModal(c.certCode)}
                          title="Ver certificación"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ===== MODAL CREAR ===== */}
      {openCreate && (
        <div onClick={closeCreateModal} className="ds-modal-backdrop">
          <div
            onClick={(e) => e.stopPropagation()}
            className="ds-modal ds-modal-xl"
          >
            <div className="ds-modal-header">
              <h5 className="ds-modal-title m-0">Nueva Certificación</h5>

              <button
                type="button"
                onClick={closeCreateModal}
                className="btn btn-sm btn-outline-secondary"
                aria-label="Cerrar"
              >
                Cerrar
              </button>
            </div>

            <form
              onSubmit={handleCreateCertification}
              className="ds-modal-body"
            >
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label ds-label">Código</label>
                  <input
                    className="form-control certs-input"
                    placeholder="Ej: 2001"
                    value={newCert.certCode}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, certCode: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-9">
                  <label className="form-label ds-label">Nombre</label>
                  <input
                    className="form-control certs-input"
                    placeholder="Nombre de la certificación"
                    value={newCert.name}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label ds-label">Campus</label>
                  <select
                    className="form-select certs-select"
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
                  <label className="form-label ds-label">Unidad</label>
                  <input
                    className="form-control certs-input"
                    placeholder="Facultad / Unidad"
                    value={newCert.ownerUnit}
                    onChange={(e) =>
                      setNewCert((p) => ({ ...p, ownerUnit: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="btn btn-outline-secondary"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL VER ===== */}
      {selectedCertCode && (
        <div onClick={closeViewModal} className="ds-modal-backdrop">
          <div
            onClick={(e) => e.stopPropagation()}
            className="ds-modal ds-modal-xl"
          >
            <div className="ds-modal-header">
              <h5 className="ds-modal-title m-0">
                Certificación {selectedCertCode}
              </h5>

              <button
                type="button"
                onClick={closeViewModal}
                className="btn btn-sm btn-outline-secondary"
                aria-label="Cerrar"
              >
                Cerrar
              </button>
            </div>

            <div className="ds-modal-body">
              <CertificationsDetail
                certCode={selectedCertCode}
                onUpdated={fetchCerts}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
