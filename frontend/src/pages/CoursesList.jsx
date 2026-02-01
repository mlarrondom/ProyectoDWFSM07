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

      if (
        !payload.courseCode ||
        !payload.name ||
        Number.isNaN(payload.credits)
      ) {
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
    <div className="container py-2 ds-table-page">
      <div className="ds-card courses-toolbar">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div>
            <h2 className="m-0 courses-title">Cursos - Mantenedor</h2>
          </div>

          <div className="d-flex gap-2 align-items-center">
            <input
              className="form-control ds-filter-input"
              placeholder="Filtrar por código o nombre..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />

            <button
              className="btn btn-cta d-flex align-items-center justify-content-between"
              onClick={openCreateModal}
            >
              <span>Agregar</span>
              <i className="bi bi-plus-lg"></i>
            </button>
          </div>
        </div>
      </div>

      {msgError && <div className="alert alert-danger mt-3">{msgError}</div>}
      {msgOk && <div className="alert alert-success mt-3">{msgOk}</div>}

      {loading ? (
        <div className="alert alert-info mt-3">Cargando cursos...</div>
      ) : (
        <>
          <div className="mb-2 text-muted mt-3">
            Mostrando <b>{filtered.length}</b> de <b>{courses.length}</b>
          </div>

          {filtered.length === 0 ? (
            <div className="alert alert-secondary">
              No hay cursos para mostrar.
            </div>
          ) : (
            <div className="ds-card courses-table-card">
              <table className="table table-hover align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th className="courses-col-code text-center">Código</th>
                    <th className="text-center">Nombre</th>
                    <th className="courses-col-credits text-center">
                      Créditos
                    </th>
                    <th className="text-end courses-col-actions text-center">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id || c.courseCode}>
                      <td className="text-center">
                        <strong>{c.courseCode}</strong>
                      </td>
                      <td className="courses-name">{c.name}</td>
                      <td className="text-center">{c.credits}</td>

                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-link btn-icon d-inline-flex align-items-center justify-content-center"
                          title="Ver detalle"
                          onClick={() => openViewModal(c.courseCode)}
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
        <div className="ds-modal-backdrop" onClick={closeCreate}>
          <div className="ds-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ds-modal-header">
              <div className="ds-modal-title">Agregar curso</div>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={closeCreate}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreate} className="ds-modal-body">
              <div className="row g-2">
                <div className="col-4">
                  <label className="form-label">Código</label>
                  <input
                    className="form-control"
                    value={newCourse.courseCode}
                    onChange={(e) =>
                      setNewCourse((p) => ({
                        ...p,
                        courseCode: e.target.value,
                      }))
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
                <button type="submit" className="btn btn-cta">
                  Guardar
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeCreate}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL VER / EDITAR ===== */}
      {openView && (
        <div className="ds-modal-backdrop" onClick={closeView}>
          <div
            className="ds-modal ds-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ds-modal-header">
              <div className="ds-modal-title">Curso {selectedCode || ""}</div>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={closeView}
              >
                Cerrar
              </button>
            </div>

            <div className="ds-modal-body">
              {detailLoading ? (
                <div className="alert alert-info">Cargando detalle...</div>
              ) : courseDetail ? (
                <>
                  {!editMode ? (
                    <>
                      <div className="row g-2">
                        <div className="col-4">
                          <div className="text-muted courses-meta-label">
                            Código
                          </div>
                          <div className="courses-meta-value">
                            {courseDetail.courseCode}
                          </div>
                        </div>

                        <div className="col-8">
                          <div className="text-muted courses-meta-label">
                            Nombre
                          </div>
                          <div className="courses-meta-value">
                            {courseDetail.name}
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="text-muted courses-meta-label">
                            Créditos
                          </div>
                          <div className="courses-meta-value">
                            {courseDetail.credits}
                          </div>
                        </div>

                        <div className="col-8">
                          <div className="text-muted courses-meta-label">
                            Área
                          </div>
                          <div className="courses-meta-value">
                            {courseDetail.area || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-4">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => setEditMode(true)}
                        >
                          Editar
                        </button>

                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleDelete}
                        >
                          Eliminar
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
                              setEditCourse((p) => ({
                                ...p,
                                name: e.target.value,
                              }))
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
                              setEditCourse((p) => ({
                                ...p,
                                credits: e.target.value,
                              }))
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
                              setEditCourse((p) => ({
                                ...p,
                                area: e.target.value,
                              }))
                            }
                            placeholder="Opcional"
                          />
                        </div>
                      </div>

                      <div className="d-flex gap-2 mt-4">
                        <button type="submit" className="btn btn-cta">
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
