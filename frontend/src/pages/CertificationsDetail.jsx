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

export default function CertificationsDetail({ certCode, onUpdated }) {
  const { token, user } = useAuth();
  const role = user?.user?.role || user?.role || "-";

  // ===== Data =====
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

  // ===== Edit general =====
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    name: "",
    campus: "",
    ownerUnit: "",
  });

  // ===== Add requirement row =====
  const [addingReq, setAddingReq] = useState(false);
  const [savingReq, setSavingReq] = useState(false);
  const [reqForm, setReqForm] = useState({
    group: 1,
    type: "CREDITS",
    condition: "Y",
    creditsRequired: "",
    courseInput: "", // input buscable (datalist)
  });

  // ===== Fetchers =====
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

      const res = await fetch(
        `${API}/api/certifications/${certCode}/requirements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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

  // ===== Helpers =====
  const typeLabel = (type) =>
    TYPE_OPTIONS.find((t) => t.value === type)?.label || type;

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
    // value = "DW101 - HTML..." (pero también sirve escribir "DW101")
    return (courses || []).map((c) => ({
      key: c.courseCode,
      value: `${c.courseCode} - ${c.name}`,
      label: `${c.courseCode}: ${c.name}`,
    }));
  }, [courses]);

  const parseCourseCode = (raw) => {
    const s = String(raw || "").trim();
    if (!s) return "";
    // "DW101 - Nombre" => "DW101"
    return s.split(" - ")[0].trim();
  };

  // ===== Actions: Edit general =====
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

      // Si tu backend restringe campus por rol, esto igual lo respeta:
      // - admin lo manda
      // - sedes no lo mandan
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
      if (!res.ok)
        throw new Error(data?.msg || "Error actualizando certificación");

      setMsgOk("Certificación actualizada.");
      setIsEditingGeneral(false);
      await refreshAll();
    } catch (err) {
      setMsgError(err.message || "Error actualizando certificación");
    } finally {
      setSavingGeneral(false);
    }
  };

  // ===== Actions: Add requirement =====
  const startAddRequirement = () => {
    resetMsgs();
    setAddingReq(true);
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

    // Backend: CREDITS => group 1 y condition "Y"
    if (type === "CREDITS" && group !== 1) {
      setMsgError('Créditos deben ir en grupo 1.');
      return;
    }

    if (type === "CREDITS" && reqForm.condition !== "Y") {
      setMsgError('Créditos deben ser Obligatorio.');
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

      const res = await fetch(
        `${API}/api/certifications/${certCode}/requirements`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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

  // ===== Actions: Delete requirement =====
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
      if (!res.ok)
        throw new Error(data?.msg || "Error eliminando requerimiento");

      setMsgOk("Requerimiento eliminado.");
      await refreshAll();
    } catch (err) {
      setMsgError(err.message || "Error eliminando requerimiento");
    }
  };

  // ===== Render guards =====
  if (msgError && !certification && !loadingCert) {
    return <div className="alert alert-danger">{msgError}</div>;
  }

  if (loadingCert || !certification) {
    return <div className="alert alert-secondary">Cargando...</div>;
  }

  return (
    <div>
      {/* Top actions */}
      <div className="d-flex justify-content-end mb-3">
        {!isEditingGeneral ? (
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={startEditGeneral}
            style={{ borderRadius: 10, fontWeight: 700 }}
          >
            ✏️ Editar
          </button>
        ) : (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={cancelEditGeneral}
              disabled={savingGeneral}
              style={{ borderRadius: 10, fontWeight: 700 }}
            >
              Cancelar
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={saveGeneral}
              disabled={savingGeneral}
              style={{ borderRadius: 10, fontWeight: 800 }}
            >
              {savingGeneral ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {msgError && <div className="alert alert-danger">{msgError}</div>}
      {msgOk && <div className="alert alert-success">{msgOk}</div>}

      {/* Info general */}
      <div className="row g-3">
        <div className="col-md-3">
          <div className="ds-labelMuted">Código</div>
          <div style={{ fontWeight: 800 }}>{certification.certCode}</div>
        </div>

        <div className="col-md-9">
          <div className="ds-labelMuted">Nombre</div>
          {!isEditingGeneral ? (
            <div className="ds-titleBlue" style={{ fontWeight: 800 }}>
              {certification.name}
            </div>
          ) : (
            <input
              className="form-control ds-input"
              value={generalForm.name}
              onChange={(e) =>
                setGeneralForm((p) => ({ ...p, name: e.target.value }))
              }
            />
          )}
        </div>

        <div className="col-md-4">
          <div className="ds-labelMuted">Campus</div>
          {!isEditingGeneral ? (
            <div style={{ fontWeight: 700 }}>{certification.campus || "-"}</div>
          ) : (
            <select
              className="form-select ds-select"
              value={generalForm.campus}
              onChange={(e) =>
                setGeneralForm((p) => ({ ...p, campus: e.target.value }))
              }
              disabled={role !== "admin"}
              title={
                role !== "admin"
                  ? "Solo admin puede modificar campus"
                  : "Selecciona campus"
              }
            >
              <option value="Santiago">Santiago</option>
              <option value="Concepción">Concepción</option>
            </select>
          )}
        </div>

        <div className="col-md-8">
          <div className="ds-labelMuted">Unidad</div>
          {!isEditingGeneral ? (
            <div style={{ fontWeight: 700 }}>
              {certification.ownerUnit || "-"}
            </div>
          ) : (
            <input
              className="form-control ds-input"
              value={generalForm.ownerUnit}
              onChange={(e) =>
                setGeneralForm((p) => ({ ...p, ownerUnit: e.target.value }))
              }
            />
          )}
        </div>
      </div>

      <hr className="my-4" />

      {/* Requirements */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 style={{ fontWeight: 900, margin: 0 }}>Requerimientos</h6>
      </div>

      {loadingReq ? (
        <div className="alert alert-secondary">Cargando requerimientos...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle w-100">
            <thead className="table-light">
              <tr>
                <th style={{ width: 110 }}>Grupo</th>
                <th style={{ width: 200 }}>Tipo</th>
                <th>Valor</th>
                <th style={{ width: 180 }}>Condición</th>
                <th className="text-end" style={{ width: 140 }}>
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {requirements.map((r) => (
                <tr key={r.requirementId}>
                  <td style={{ fontWeight: 800 }}>{r.group}</td>
                  <td>{typeLabel(r.type)}</td>
                  <td>{formatReqValue(r)}</td>
                  <td>{conditionLabel(r.condition)}</td>
                  <td className="text-end">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      style={{ borderRadius: 10 }}
                      onClick={() => handleDeleteRequirement(r.requirementId)}
                      title="Eliminar"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {requirements.length === 0 && !addingReq && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    Esta certificación no tiene requerimientos aún.
                  </td>
                </tr>
              )}

              {/* Add row */}
              {!addingReq ? (
                <tr>
                  <td colSpan={5}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={startAddRequirement}
                      style={{ borderRadius: 10, fontWeight: 700 }}
                    >
                      ➕ Agregar requerimiento
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  {/* Grupo */}
                  <td>
                    <select
                      className="form-select ds-select"
                      value={reqForm.group}
                      onChange={(e) =>
                        setReqForm((p) => ({
                          ...p,
                          group: Number(e.target.value),
                        }))
                      }
                      disabled={reqForm.type === "CREDITS"} // créditos siempre group 1
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </td>

                  {/* Tipo */}
                  <td>
                    <select
                      className="form-select ds-select"
                      value={reqForm.type}
                      onChange={(e) => {
                        const nextType = e.target.value;
                        setReqForm((p) => ({
                          ...p,
                          type: nextType,
                          // reglas backend:
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

                  {/* Valor */}
                  <td>
                    {reqForm.type === "CREDITS" ? (
                      <input
                        className="form-control ds-input"
                        type="number"
                        min="0"
                        placeholder="Ej: 24"
                        value={reqForm.creditsRequired}
                        onChange={(e) =>
                          setReqForm((p) => ({
                            ...p,
                            creditsRequired: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <>
                        <input
                          className="form-control ds-input"
                          list="courses-datalist"
                          placeholder="Escribe código o nombre del curso..."
                          value={reqForm.courseInput}
                          onChange={(e) =>
                            setReqForm((p) => ({
                              ...p,
                              courseInput: e.target.value,
                            }))
                          }
                          disabled={loadingCourses}
                        />
                        <datalist id="courses-datalist">
                          {datalistOptions.map((o) => (
                            <option key={o.key} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </datalist>

                        {courses.length === 0 && !loadingCourses && (
                          <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                            No se pudieron cargar cursos (o tu rol no tiene acceso).
                            Puedes escribir el código exacto igualmente.
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  {/* Condición */}
                  <td>
                    <select
                      className="form-select ds-select"
                      value={reqForm.condition}
                      onChange={(e) =>
                        setReqForm((p) => ({
                          ...p,
                          condition: e.target.value,
                        }))
                      }
                      disabled={reqForm.type === "CREDITS"} // backend: credits siempre Y
                      title={
                        reqForm.type === "CREDITS"
                          ? 'Créditos siempre es "Obligatorio"'
                          : "Selecciona condición"
                      }
                    >
                      <option value="Y">Obligatorio</option>
                      <option value="O">Electivo</option>
                    </select>
                  </td>

                  {/* Acciones */}
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={cancelAddRequirement}
                        disabled={savingReq}
                        style={{ borderRadius: 10, fontWeight: 700 }}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={saveAddRequirement}
                        disabled={savingReq}
                        style={{ borderRadius: 10, fontWeight: 800 }}
                      >
                        {savingReq ? "Guardando..." : "Guardar"}
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
