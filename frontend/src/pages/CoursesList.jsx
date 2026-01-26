import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function CoursesList() {
  const API = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgOk, setMsgOk] = useState("");

  // Modal states
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);

  const [selectedCode, setSelectedCode] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Form create
  const [newCourse, setNewCourse] = useState({
    courseCode: "",
    name: "",
    credits: "",
    area: "",
  });

  // Form edit (se llena desde courseDetail)
  const [editMode, setEditMode] = useState(false);
  const [editCourse, setEditCourse] = useState({
    name: "",
    credits: "",
    area: "",
  });

  const headersAuth = useMemo(() => {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setMsgError("");
      setMsgOk("");

      const res = await fetch(`${API}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.msg || "Error al obtener cursos");

      setCourses(data?.courses || []);
    } catch (err) {
      setMsgError(err.message || "Error al obtener cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return courses;

    return courses.filter((c) => {
      const code = String(c.courseCode ?? "").toLowerCase();
      const name = String(c.name ?? "").toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }, [courses, filter]);

  // ====== VIEW / DETAIL ======
  const openViewModal = async (courseCode) => {
    setOpenView(true);
    setEditMode(false);
    setSelectedCode(courseCode);
    setCourseDetail(null);
    setMsgError("");
    setMsgOk("");

    try {
      setDetailLoading(true);
      const res = await fetch(`${API}/api/courses/${courseCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.msg || "Error al obtener detalle");

      const detail = data?.course;
      setCourseDetail(detail);

      // precargar form edición
      setEditCourse({
        name: detail?.name ?? "",
        credits: detail?.credits ?? "",
        area: detail?.area ?? "",
      });
    } catch (err) {
      setMsgError(err.message || "Error al obtener detalle");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeView = () => {
    setOpenView(false);
    setSelectedCode(null);
    setCourseDetail(null);
    setEditMode(false);
  };

  // ====== CREATE ======
  const openCreateModal = () => {
    setMsgError("");
    setMsgOk("");
    setNewCourse({ courseCode: "", name: "", credits: "", area: "" });
    setOpenCreate(true);
  };

  const closeCreate = () => setOpenCreate(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMsgError("");
    setMsgOk("");

    try {
      const payload = {
        courseCode: String(newCourse.courseCode).trim(),
        name: String(newCourse.name).trim(),
        credits: Number(newCourse.credits),
        area: String(newCourse.area).trim() || undefined,
      };

      if (!payload.courseCode || !payload.name || Number.isNaN(payload.credits)) {
        setMsgError("Completa courseCode, name y credits.");
        return;
      }

      const res = await fetch(`${API}/api/courses`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.msg || "Error al crear curso");

      setMsgOk("Curso creado.");
      setOpenCreate(false);
      await fetchCourses();
    } catch (err) {
      setMsgError(err.message || "Error al crear curso");
    }
  };

  // ====== UPDATE ======
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedCode) return;

    setMsgError("");
    setMsgOk("");

    try {
      const payload = {
        name: String(editCourse.name).trim(),
        credits: Number(editCourse.credits),
        area: String(editCourse.area).trim() || undefined,
      };

      if (!payload.name || Number.isNaN(payload.credits)) {
        setMsgError("Completa name y credits.");
        return;
      }

      const res = await fetch(`${API}/api/courses/${selectedCode}`, {
        method: "PUT",
        headers: headersAuth,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.msg || "Error al actualizar curso");

      setMsgOk("Curso actualizado.");
      setEditMode(false);

      // refrescar detalle + lista
      await openViewModal(selectedCode);
      await fetchCourses();
    } catch (err) {
      setMsgError(err.message || "Error al actualizar curso");
    }
  };

  // ====== DELETE ======
  const handleDelete = async () => {
    if (!selectedCode) return;

    const ok = window.confirm(`¿Eliminar el curso ${selectedCode}?`);
    if (!ok) return;

    setMsgError("");
    setMsgOk("");

    try {
      const res = await fetch(`${API}/api/courses/${selectedCode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.msg || "Error al eliminar curso");

      setMsgOk("Curso eliminado.");
      closeView();
      await fetchCourses();
    } catch (err) {
      setMsgError(err.message || "Error al eliminar curso");
    }
  };

  return (
    <div className="container py-2">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          <h2 className="m-0" style={{ color: "#006699" }}>
            Cursos - Mantenedor
          </h2>
          <small className="text-muted">Gestión de cursos</small>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <input
            className="form-control"
            style={{ maxWidth: 320, borderRadius: 8 }}
            placeholder="Filtrar por código o nombre..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />

          <button
            className="btn"
            style={{ background: "#FF6600", color: "white", borderRadius: 8 }}
            onClick={openCreateModal}
          >
            Agregar
          </button>
        </div>
      </div>

      {msgError && <div className="alert alert-danger">{msgError}</div>}
      {msgOk && <div className="alert alert-success">{msgOk}</div>}

      {loading ? (
        <div className="alert alert-info">Cargando cursos...</div>
      ) : (
        <>
          <div className="mb-2 text-muted">
            Mostrando <b>{filtered.length}</b> de <b>{courses.length}</b>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-secondary">No hay cursos para mostrar.</div>
          ) : (
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 140 }}>Código</th>
                  <th>Nombre</th>
                  <th style={{ width: 120 }}>Créditos</th>
                  <th className="text-end" style={{ width: 120 }}>
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id || c.courseCode}>
                    <td>
                      <strong>{c.courseCode}</strong>
                    </td>
                    <td style={{ color: "#006699", fontWeight: 600 }}>{c.name}</td>
                    <td>{c.credits}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="Ver detalle"
                        onClick={() => openViewModal(c.courseCode)}
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
        <div
          onClick={closeCreate}
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
              maxWidth: 620,
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
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800 }}>Agregar curso</div>
              <button className="btn btn-sm btn-light" onClick={closeCreate}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ padding: 16 }}>
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label">Código</label>
                  <input
                    className="form-control"
                    value={newCourse.courseCode}
                    onChange={(e) =>
                      setNewCourse((p) => ({ ...p, courseCode: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-8">
                  <label className="form-label">Nombre</label>
                  <input
                    className="form-control"
                    value={newCourse.name}
                    onChange={(e) =>
                      setNewCourse((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-4">
                  <label className="form-label">Créditos</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newCourse.credits}
                    onChange={(e) =>
                      setNewCourse((p) => ({ ...p, credits: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="col-8">
                  <label className="form-label">Área (opcional)</label>
                  <input
                    className="form-control"
                    value={newCourse.area}
                    onChange={(e) =>
                      setNewCourse((p) => ({ ...p, area: e.target.value }))
                    }
                    placeholder="Ej: Programación, Datos..."
                  />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn"
                  style={{
                    background: "#FF6600",
                    color: "white",
                    borderRadius: 8,
                  }}
                >
                  Guardar
                </button>

                <button type="button" className="btn btn-outline-secondary" onClick={closeCreate}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL VER / EDITAR ===== */}
      {openView && (
        <div
          onClick={closeView}
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
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 800 }}>
                Curso {selectedCode || ""}
              </div>
              <button className="btn btn-sm btn-light" onClick={closeView}>
                ✕
              </button>
            </div>

            <div style={{ padding: 16 }}>
              {detailLoading ? (
                <div className="alert alert-info">Cargando detalle...</div>
              ) : courseDetail ? (
                <>
                  {!editMode ? (
                    <>
                      <div className="row g-2">
                        <div className="col-4">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Código
                          </div>
                          <div style={{ fontWeight: 700 }}>{courseDetail.courseCode}</div>
                        </div>

                        <div className="col-8">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Nombre
                          </div>
                          <div style={{ fontWeight: 700 }}>{courseDetail.name}</div>
                        </div>

                        <div className="col-4">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Créditos
                          </div>
                          <div style={{ fontWeight: 700 }}>{courseDetail.credits}</div>
                        </div>

                        <div className="col-8">
                          <div className="text-muted" style={{ fontSize: 12 }}>
                            Área
                          </div>
                          <div style={{ fontWeight: 700 }}>{courseDetail.area || "-"}</div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-4">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => setEditMode(true)}
                        >
                          ✏️ Editar
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={handleDelete}
                        >
                          🗑 Eliminar
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleUpdate}>
                      <div className="row g-2">
                        <div className="col-12">
                          <label className="form-label">Nombre</label>
                          <input
                            className="form-control"
                            value={editCourse.name}
                            onChange={(e) =>
                              setEditCourse((p) => ({ ...p, name: e.target.value }))
                            }
                            required
                          />
                        </div>

                        <div className="col-4">
                          <label className="form-label">Créditos</label>
                          <input
                            type="number"
                            className="form-control"
                            value={editCourse.credits}
                            onChange={(e) =>
                              setEditCourse((p) => ({ ...p, credits: e.target.value }))
                            }
                            required
                          />
                        </div>

                        <div className="col-8">
                          <label className="form-label">Área</label>
                          <input
                            className="form-control"
                            value={editCourse.area}
                            onChange={(e) =>
                              setEditCourse((p) => ({ ...p, area: e.target.value }))
                            }
                            placeholder="Opcional"
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-4">
                        <button
                          type="submit"
                          className="btn"
                          style={{
                            background: "#FF6600",
                            color: "white",
                            borderRadius: 8,
                          }}
                        >
                          Guardar cambios
                        </button>

                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setEditMode(false)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="alert alert-secondary">
                  No se encontró detalle del curso.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}