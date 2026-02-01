import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const TYPE_OPTIONS = [
  { value: "CREDITS", label: "Créditos" },
  { value: "COURSE", label: "Asignatura" },
];

const CONDITION_OPTIONS = [
  { value: "Y", label: "Obligatorio" },
  { value: "O", label: "Electivo" },
];

/*
  Owner Units:
  Me falta el modelo de Certification (o el enum/constante) para cargar el listado real.
  Por ahora:
  - Si no hay listado, el select muestra solo el valor actual (evita inventar valores).
  - Cuando me pases el modelo, lo reemplazamos por el enum real.
*/
const OWNER_UNIT_OPTIONS = [];

export default function CertificationsDetail({ certCode, onUpdated }) {
  const { token, user } = useAuth();
  const role = user?.user?.role || user?.role || "-";

  const [certification, setCertification] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loadingCert, setLoadingCert] = useState(false);
  const [loadingReq, setLoadingReq] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [msgOk, setMsgOk] = useState("");
  const [msgError, setMsgError] = useState("");

  const resetMsgs = () => {
    setMsgOk("");
    setMsgError("");
  };

  // Edit general
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    name: "",
    campus: "",
    ownerUnit: "",
  });

  // Add requirement row
  const [addingReq, setAddingReq] = useState(false);
  const [savingReq, setSavingReq] = useState(false);
  const [reqForm, setReqForm] = useState({
    group: 1,
    type: "CREDITS",
    condition: "Y",
    creditsRequired: "",
    courseInput: "",
  });

  // Edit requirement
  const [editingReqId, setEditingReqId] = useState(null);
  const [savingEditReq, setSavingEditReq] = useState(false);
  const [editReqForm, setEditReqForm] = useState({
    type: "",
    creditsRequired: "",
    courseInput: "",
  });

  const fetchCertification = async () => {
    if (!certCode || !token) return;

    try {
      setLoadingCert(true);
      resetMsgs();

      const res = await fetch(`${API}/api/certifications/${certCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error cargando certificación");

      const c = data?.certification || null;
      setCertification(c);

      setGeneralForm({
        name: c?.name || "",
        campus: c?.campus || "",
        ownerUnit: c?.ownerUnit || "",
      });
    } catch (err) {
      setMsgError(err.message || "Error cargando certificación");
      setCertification(null);
    } finally {
      setLoadingCert(false);
    }
  };

  const fetchRequirements = async () => {
    if (!certCode || !token) return;

    try {
      setLoadingReq(true);
      resetMsgs();

      const res = await fetch(`${API}/api/certifications/${certCode}/requirements`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error cargando requerimientos");

      setRequirements(data?.requirements || []);
    } catch (err) {
      setMsgError(err.message || "Error cargando requerimientos");
      setRequirements([]);
    } finally {
      setLoadingReq(false);
    }
  };

  const fetchCourses = async () => {
    if (!token) return;

    try {
      setLoadingCourses(true);

      const res = await fetch(`${API}/api/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setCourses([]);
        return;
      }

      setCourses(data?.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const refreshAll = async () => {
    await fetchCertification();
    await fetchRequirements();
    onUpdated?.();
  };

  useEffect(() => {
    fetchCertification();
    fetchRequirements();
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [certCode, token]);

  const typeLabel = (type) => TYPE_OPTIONS.find((t) => t.value === type)?.label || type;

  const conditionLabel = (cond) =>
    CONDITION_OPTIONS.find((c) => c.value === cond)?.label || cond;

  const formatReqValue = (r) => {
    if (r.type === "CREDITS") return r.creditsRequired ?? "-";
    if (r.type === "COURSE") {
      const code = r?.course?.courseCode ?? "-";
      const name = r?.course?.name ?? "";
      return `${code}: ${name}`.trim();
    }
    return "-";
  };

  const datalistOptions = useMemo(() => {
    return (courses || []).map((c) => ({
      key: c.courseCode,
      value: `${c.courseCode} - ${c.name}`,
      label: `${c.courseCode}: ${c.name}`,
    }));
  }, [courses]);

  const parseCourseCode = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    return s.split(" - ")[0].trim();
  };

  const startEditGeneral = () => {
    resetMsgs();
    setIsEditingGeneral(true);
  };

  const cancelEditGeneral = () => {
    resetMsgs();
    setIsEditingGeneral(false);
    setGeneralForm({
      name: certification?.name || "",
      campus: certification?.campus || "",
      ownerUnit: certification?.ownerUnit || "",
    });
  };

  const saveGeneral = async () => {
    resetMsgs();

    const name = String(generalForm.name || "").trim();
    const ownerUnit = String(generalForm.ownerUnit || "").trim();
    const campus = String(generalForm.campus || "").trim();

    if (!name) {
      setMsgError("El nombre no puede quedar vacío.");
      return;
    }

    try {
      setSavingGeneral(true);

      const payload = { name, ownerUnit };

      if (role === "admin") payload.campus = campus;

      const res = await fetch(`${API}/api/certifications/${certCode}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error actualizando certificación");

      setMsgOk("Certificación actualizada.");
      setIsEditingGeneral(false);
      await refreshAll();
    } catch (err) {
      setMsgError(err.message || "Error actualizando certificación");
    } finally {
      setSavingGeneral(false);
    }
  };

  const startAddRequirement = () => {
    resetMsgs();
    setAddingReq(true);
    setEditingReqId(null);
    setReqForm({
      group: 1,
      type: "CREDITS",
      condition: "Y",
      creditsRequired: "",
      courseInput: "",
    });
  };

  const cancelAddRequirement = () => {
    resetMsgs();
    setAddingReq(false);
  };

  const saveAddRequirement = async () => {
    resetMsgs();

    const group = Number(reqForm.group);
    const type = String(reqForm.type);

    if (![1, 2, 3].includes(group)) {
      setMsgError("Grupo debe ser 1, 2 o 3.");
      return;
    }

    if (!["CREDITS", "COURSE"].includes(type)) {
      setMsgError("Tipo inválido.");
      return;
    }

    if (type === "CREDITS" && group !== 1) {
      setMsgError("Créditos deben ir en grupo 1.");
      return;
    }

    if (type === "CREDITS" && reqForm.condition !== "Y") {
      setMsgError('Créditos deben ser "Obligatorio".');
      return;
    }

    const payload = {
      group,
      type,
      condition: reqForm.condition,
    };

    if (type === "CREDITS") {
      const creditsNum = Number(reqForm.creditsRequired);
      if (!Number.isFinite(creditsNum) || creditsNum <= 0) {
        setMsgError("Créditos debe ser un número mayor a 0.");
        return;
      }
      payload.creditsRequired = creditsNum;
    }

    if (type === "COURSE") {
      const courseCode = parseCourseCode(reqForm.courseInput);
      if (!courseCode) {
        setMsgError("Selecciona o escribe un curso válido.");
        return;
      }
      payload.courseCode = courseCode;
    }

    try {
      setSavingReq(true);

      const res = await fetch(`${API}/api/certifications/${certCode}/requirements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error creando requerimiento");

      setMsgOk("Requerimiento creado.");
      setAddingReq(false);
      await refreshAll();
    } catch (err) {
      setMsgError(err.message || "Error creando requerimiento");
    } finally {
      setSavingReq(false);
    }
  };

  const handleDeleteRequirement = async (requirementId) => {
    resetMsgs();
    const ok = window.confirm("¿Eliminar este requerimiento?");
    if (!ok) return;

    try {
      const res = await fetch(
        `${API}/api/certifications/${certCode}/requirements/${requirementId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data?.msg || "Error eliminando requerimiento");

      setMsgOk("Requerimiento eliminado.");
      await refreshAll();
    } catch (err) {
      setMsgError(err.message || "Error eliminando requerimiento");
    }
  };

  const startEditRequirement = (r) => {
    resetMsgs();
    setAddingReq(false);
    setEditingReqId(r.requirementId);

    if (r.type === "CREDITS") {
      setEditReqForm({
        type: "CREDITS",
        creditsRequired: String(r.creditsRequired ?? ""),
        courseInput: "",
      });
      return;
    }

    const currentCourseCode = r?.course?.courseCode ?? "";
    const currentCourseName = r?.course?.name ?? "";
    setEditReqForm({
      type: "COURSE",
      creditsRequired: "",
      courseInput: currentCourseCode ? `${currentCourseCode} - ${currentCourseName}` : "",
    });
  };

  const cancelEditRequirement = () => {
    resetMsgs();
    setEditingReqId(null);
    setEditReqForm({ type: "", creditsRequired: "", courseInput: "" });
  };

  const tryPatch = async (urls, body) => {
    let lastErr = null;

    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) return { ok: true, data };

        lastErr = new Error(data?.msg || "Error actualizando requerimiento");
      } catch (e) {
        lastErr = e;
      }
    }

    return { ok: false, error: lastErr || new Error("Error actualizando requerimiento") };
  };

  const saveEditRequirement = async (requirementId) => {
    resetMsgs();

    try {
      setSavingEditReq(true);

      if (editReqForm.type === "CREDITS") {
        const creditsNum = Number(editReqForm.creditsRequired);
        if (!Number.isFinite(creditsNum) || creditsNum <= 0) {
          setMsgError("Créditos debe ser un número mayor a 0.");
          return;
        }

        const urls = [
          `${API}/api/certifications/${certCode}/requirements/${requirementId}`,
          `${API}/api/certifications/${certCode}/requirements/${requirementId}/credits`,
        ];

        const result = await tryPatch(urls, { creditsRequired: creditsNum });
        if (!result.ok) throw result.error;

        setMsgOk("Requerimiento actualizado.");
        setEditingReqId(null);
        await refreshAll();
        return;
      }

      if (editReqForm.type === "COURSE") {
        const courseCode = parseCourseCode(editReqForm.courseInput);
        if (!courseCode) {
          setMsgError("Selecciona o escribe un curso válido.");
          return;
        }

        const urls = [
          `${API}/api/certifications/${certCode}/requirements/${requirementId}`,
          `${API}/api/certifications/${certCode}/requirements/${requirementId}/course`,
        ];

        const result = await tryPatch(urls, { courseCode });
        if (!result.ok) throw result.error;

        setMsgOk("Requerimiento actualizado.");
        setEditingReqId(null);
        await refreshAll();
      }
    } catch (err) {
      setMsgError(err.message || "Error actualizando requerimiento");
    } finally {
      setSavingEditReq(false);
    }
  };

  if (msgError && !certification && !loadingCert) {
    return <div className="alert alert-danger">{msgError}</div>;
  }

  if (loadingCert || !certification) {
    return <div className="alert alert-secondary">Cargando...</div>;
  }

  const ownerUnitOptions = OWNER_UNIT_OPTIONS.length
    ? OWNER_UNIT_OPTIONS
    : Array.from(new Set([generalForm.ownerUnit, certification.ownerUnit].filter(Boolean)));

  return (
    <div>
      <div className="d-flex justify-content-end mb-3 gap-2">
        {!isEditingGeneral ? (
          <button
            type="button"
            className="btn btn-link btn-ghost d-inline-flex align-items-center justify-content-center btn-icon"
            onClick={startEditGeneral}
            title="Editar información general"
          >
            <i className="bi bi-pencil"></i>
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelEditGeneral}
              disabled={savingGeneral}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center gap-2"
              onClick={saveGeneral}
              disabled={savingGeneral}
            >
              <span>{savingGeneral ? "Guardando..." : "Guardar"}</span>
              <i className="bi bi-check2"></i>
            </button>
          </>
        )}
      </div>

      {msgError && <div className="alert alert-danger">{msgError}</div>}
      {msgOk && <div className="alert alert-success">{msgOk}</div>}

      {/* Info general */}
      <div className="ds-info-card">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="ds-info-label">Código</div>
            <div className="ds-info-value">{certification.certCode}</div>
          </div>

          <div className="col-md-9">
            <div className="ds-info-label">Nombre</div>
            {!isEditingGeneral ? (
              <div className="ds-info-value">{certification.name}</div>
            ) : (
              <input
                className="form-control ds-input"
                value={generalForm.name}
                onChange={(e) => setGeneralForm((p) => ({ ...p, name: e.target.value }))}
              />
            )}
          </div>

          <div className="col-md-4">
            <div className="ds-info-label">Campus</div>
            {!isEditingGeneral ? (
              <div className="ds-info-value">{certification.campus || "-"}</div>
            ) : (
              <select
                className="form-select ds-select"
                value={generalForm.campus}
                onChange={(e) => setGeneralForm((p) => ({ ...p, campus: e.target.value }))}
                disabled={role !== "admin"}
                title={role !== "admin" ? "Solo admin puede modificar campus" : "Selecciona campus"}
              >
                <option value="Santiago">Santiago</option>
                <option value="Concepción">Concepción</option>
              </select>
            )}
          </div>

          <div className="col-md-8">
            <div className="ds-info-label">Unidad</div>
            {!isEditingGeneral ? (
              <div className="ds-info-value">{certification.ownerUnit || "-"}</div>
            ) : (
              <select
                className="form-select ds-select"
                value={generalForm.ownerUnit}
                onChange={(e) => setGeneralForm((p) => ({ ...p, ownerUnit: e.target.value }))}
              >
                {ownerUnitOptions.length === 0 && <option value="">Sin unidad</option>}

                {ownerUnitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <hr className="my-4" />

      {/* Requirements */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 style={{ fontWeight: 900, margin: 0 }}>Requerimientos</h6>

        {!addingReq && editingReqId === null && (
          <button
            type="button"
            className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-between ds-btn-sb"
            onClick={startAddRequirement}
          >
            <span>Agregar requerimiento</span>
            <i className="bi bi-plus"></i>
          </button>
        )}
      </div>

      {loadingReq ? (
        <div className="alert alert-secondary">Cargando requerimientos...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle w-100 ds-req-table">
            <thead className="table-light">
              <tr>
                <th className="text-center" style={{ width: 110 }}>
                  Grupo
                </th>
                <th className="text-center" style={{ width: 200 }}>
                  Tipo
                </th>
                <th className="text-center">Valor</th>
                <th className="text-center" style={{ width: 180 }}>
                  Condición
                </th>
                <th className="text-center" style={{ width: 140 }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {requirements.map((r) => {
                const isEditingRow = editingReqId === r.requirementId;

                return (
                  <tr key={r.requirementId}>
                    <td className="text-center" style={{ fontWeight: 800 }}>
                      {r.group}
                    </td>

                    <td className="text-center">{typeLabel(r.type)}</td>

                    <td>
                      {!isEditingRow ? (
                        <div className="text-center">{formatReqValue(r)}</div>
                      ) : r.type === "CREDITS" ? (
                        <input
                          className="form-control ds-input"
                          type="number"
                          min="0"
                          value={editReqForm.creditsRequired}
                          onChange={(e) =>
                            setEditReqForm((p) => ({ ...p, creditsRequired: e.target.value }))
                          }
                        />
                      ) : (
                        <>
                          <input
                            className="form-control ds-input"
                            list="courses-datalist-edit"
                            placeholder="Escribe código o nombre del curso..."
                            value={editReqForm.courseInput}
                            onChange={(e) =>
                              setEditReqForm((p) => ({ ...p, courseInput: e.target.value }))
                            }
                            disabled={loadingCourses}
                          />
                          <datalist id="courses-datalist-edit">
                            {datalistOptions.map((o) => (
                              <option key={o.key} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </datalist>
                        </>
                      )}
                    </td>

                    <td className="text-center">{conditionLabel(r.condition)}</td>

                    <td className="text-center">
                      {!isEditingRow ? (
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon d-inline-flex align-items-center justify-content-center"
                            onClick={() => startEditRequirement(r)}
                            title="Editar requerimiento"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon d-inline-flex align-items-center justify-content-center"
                            onClick={() => handleDeleteRequirement(r.requirementId)}
                            title="Eliminar requerimiento"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      ) : (
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon d-inline-flex align-items-center justify-content-center"
                            onClick={cancelEditRequirement}
                            title="Cancelar"
                            disabled={savingEditReq}
                          >
                            <i className="bi bi-x-lg"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon d-inline-flex align-items-center justify-content-center"
                            onClick={() => saveEditRequirement(r.requirementId)}
                            title="Guardar"
                            disabled={savingEditReq}
                          >
                            <i className="bi bi-check2"></i>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {requirements.length === 0 && !addingReq && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Esta certificación no tiene requerimientos aún.
                  </td>
                </tr>
              )}

              {/* Add row */}
              {addingReq && (
                <tr>
                  <td className="text-center">
                    <select
                      className="form-select ds-select"
                      value={reqForm.group}
                      onChange={(e) =>
                        setReqForm((p) => ({ ...p, group: Number(e.target.value) }))
                      }
                      disabled={reqForm.type === "CREDITS"}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </td>

                  <td className="text-center">
                    <select
                      className="form-select ds-select"
                      value={reqForm.type}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        setReqForm((p) => ({
                          ...p,
                          type: nextType,
                          group: nextType === "CREDITS" ? 1 : p.group,
                          condition: nextType === "CREDITS" ? "Y" : p.condition,
                          creditsRequired: "",
                          courseInput: "",
                        }));
                      }}
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    {reqForm.type === "CREDITS" ? (
                      <input
                        className="form-control ds-input"
                        type="number"
                        min="0"
                        placeholder="Ej: 24"
                        value={reqForm.creditsRequired}
                        onChange={(e) =>
                          setReqForm((p) => ({ ...p, creditsRequired: e.target.value }))
                        }
                      />
                    ) : (
                      <>
                        <input
                          className="form-control ds-input"
                          list="courses-datalist-add"
                          placeholder="Escribe código o nombre del curso..."
                          value={reqForm.courseInput}
                          onChange={(e) =>
                            setReqForm((p) => ({ ...p, courseInput: e.target.value }))
                          }
                          disabled={loadingCourses}
                        />
                        <datalist id="courses-datalist-add">
                          {datalistOptions.map((o) => (
                            <option key={o.key} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </datalist>

                        {courses.length === 0 && !loadingCourses && (
                          <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                            No se pudieron cargar cursos (o tu rol no tiene acceso). Puedes escribir el código exacto igualmente.
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  <td className="text-center">
                    <select
                      className="form-select ds-select"
                      value={reqForm.condition}
                      onChange={(e) => setReqForm((p) => ({ ...p, condition: e.target.value }))}
                      disabled={reqForm.type === "CREDITS"}
                      title={reqForm.type === "CREDITS" ? 'Créditos siempre es "Obligatorio"' : "Selecciona condición"}
                    >
                      <option value="Y">Obligatorio</option>
                      <option value="O">Electivo</option>
                    </select>
                  </td>

                  <td className="text-center">
                    <div className="d-inline-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={cancelAddRequirement}
                        disabled={savingReq}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary d-inline-flex align-items-center gap-2"
                        onClick={saveAddRequirement}
                        disabled={savingReq}
                      >
                        <span>{savingReq ? "Guardando..." : "Guardar"}</span>
                        <i className="bi bi-check2"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
