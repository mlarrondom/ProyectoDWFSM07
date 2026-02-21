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

  // ====== General edit ======
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [generalForm, setGeneralForm] = useState({
    name: "",
    campus: "",
    ownerUnit: "",
    price: "", // ✅ nuevo
  });

  // ====== Add requirement row ======
  const [addingReq, setAddingReq] = useState(false);
  const [savingReq, setSavingReq] = useState(false);
  const [reqForm, setReqForm] = useState({
    group: 1,
    type: "CREDITS",
    condition: "Y",
    creditsRequired: "",
    courseInput: "",
  });

  // ====== Edit requirement ======
  const [editingReqId, setEditingReqId] = useState(null);
  const [savingEditReq, setSavingEditReq] = useState(false);
  const [editReqForm, setEditReqForm] = useState({
    type: "",
    creditsRequired: "",
    courseInput: "",
  });

  const headersAuth = useMemo(() => {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

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
        price:
          c?.price === 0 || c?.price
            ? String(c.price)
            : "0", // ✅ nuevo
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  const typeLabel = (type) =>
    TYPE_OPTIONS.find((t) => t.value === type)?.label || type;

  const conditionLabel = (cond) =>
    CONDITION_OPTIONS.find((c) => c.value === cond)?.label || cond;

  const renderReqValue = (r) => {
    if (r.type === "CREDITS") {
      return <div className="text-left">{r.creditsRequired ?? "-"}</div>;
    }

    if (r.type === "COURSE") {
      const code = r?.course?.courseCode ?? "-";
      const name = r?.course?.name ?? "";
      return <div className="ds-req-value">{code} - {name || "-"}</div>;
    }

    return <div className="text-center">-</div>;
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

  // ====== General actions ======
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
      price:
        certification?.price === 0 || certification?.price
          ? String(certification.price)
          : "0",
    });
  };

  const saveGeneral = async () => {
    resetMsgs();

    const name = String(generalForm.name || "").trim();
    const ownerUnit = String(generalForm.ownerUnit || "").trim();
    const campus = String(generalForm.campus || "").trim();

    const priceNum =
      generalForm.price === "" || generalForm.price === null || generalForm.price === undefined
        ? 0
        : Number(generalForm.price);

    if (!name) {
      setMsgError("El nombre no puede quedar vacío.");
      return;
    }

    if (!Number.isFinite(priceNum) || priceNum < 0) {
      setMsgError("Precio debe ser un número mayor o igual a 0.");
      return;
    }

    try {
      setSavingGeneral(true);

      const payload = { name, ownerUnit, price: priceNum }; // ✅ incluye price
      if (role === "admin") payload.campus = campus;

      const res = await fetch(`${API}/api/certifications/${certCode}`, {
        method: "PUT",
        headers: headersAuth,
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

  // ====== Delete certification (solo si no hay requirements) ======
  const hasRequirements = (requirements?.length || 0) > 0;
  const canDeleteCertification = !loadingReq && !hasRequirements;

  const handleDeleteCertification = async () => {
    if (!certCode || !token) return;
    if (!canDeleteCertification) return;

    const ok = window.confirm(`¿Eliminar la certificación ${certCode}?`);
    if (!ok) return;

    resetMsgs();

    try {
      const res = await fetch(`${API}/api/certifications/${certCode}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.msg || "Error eliminando certificación");

      setMsgOk("Certificación eliminada. Puedes cerrar esta ventana.");
      setCertification(null);
      setRequirements([]);
      onUpdated?.();
    } catch (err) {
      setMsgError(err.message || "Error eliminando certificación");
    }
  };

  // ====== Requirements add/edit/delete (sin cambios) ======
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

    const payload = { group, type, condition: reqForm.condition };

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
          headers: headersAuth,
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
      courseInput: currentCourseCode
        ? `${currentCourseCode} - ${currentCourseName}`
        : "",
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
          headers: headersAuth,
          body: JSON.stringify(body),
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) return { ok: true, data };

        lastErr = new Error(data?.msg || "Error actualizando requerimiento");
      } catch (e) {
        lastErr = e;
      }
    }

    return {
      ok: false,
      error: lastErr || new Error("Error actualizando requerimiento"),
    };
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

  if (msgOk && !certification && !loadingCert) {
    return <div className="alert alert-success">{msgOk}</div>;
  }

  if (loadingCert || !certification) {
    return <div className="alert alert-secondary">Cargando...</div>;
  }

  const ownerUnitOptions = OWNER_UNIT_OPTIONS.length
    ? OWNER_UNIT_OPTIONS
    : Array.from(
        new Set([generalForm.ownerUnit, certification.ownerUnit].filter(Boolean))
      );

  return (
    <div>
      {/* =========================
          INFO GENERAL
         ========================= */}
      <div className="d-flex align-items-start justify-content-between">
        <div>
          <h6 style={{ fontWeight: 900, margin: 0 }}>Información General</h6>
        </div>

        {!isEditingGeneral && (
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-link btn-ghost d-inline-flex align-items-center justify-content-center btn-icon"
              onClick={startEditGeneral}
              title="Editar información general"
            >
              <i className="bi bi-pencil-square"></i>
            </button>

            <button
              type="button"
              className="btn btn-link btn-ghost d-inline-flex align-items-center justify-content-center btn-icon text-danger"
              onClick={handleDeleteCertification}
              disabled={!canDeleteCertification}
              title={
                canDeleteCertification
                  ? "Eliminar certificación"
                  : "No se puede eliminar: tiene requerimientos asociados"
              }
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        )}
      </div>

      {msgError && <div className="alert alert-danger mt-3">{msgError}</div>}
      {msgOk && <div className="alert alert-success mt-3">{msgOk}</div>}

      <div className="row g-3 mt-2">
        <div className="col-md-4">
          <div className="text-muted courses-meta-label">Código</div>
          <div className="courses-meta-value">{certification.certCode}</div>
        </div>

        <div className="col-md-8">
          <div className="text-muted courses-meta-label">Nombre</div>
          {!isEditingGeneral ? (
            <div className="courses-meta-value">{certification.name}</div>
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
          <div className="text-muted courses-meta-label">Campus</div>
          {!isEditingGeneral ? (
            <div className="courses-meta-value">{certification.campus || "-"}</div>
          ) : (
            <select
              className="form-select ds-selected"
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

        <div className="col-md-4">
          {/* ✅ NUEVO: Precio */}
          <div className="text-muted courses-meta-label">Precio</div>
          {!isEditingGeneral ? (
            <div className="courses-meta-value">
              {Number.isFinite(Number(certification.price))
                ? Number(certification.price)
                : 0}
            </div>
          ) : (
            <input
              className="form-control ds-input"
              type="number"
              min="0"
              step="1"
              value={generalForm.price}
              onChange={(e) =>
                setGeneralForm((p) => ({ ...p, price: e.target.value }))
              }
            />
          )}
        </div>

        <div className="col-md-4">
          <div className="text-muted courses-meta-label">Unidad</div>
          {!isEditingGeneral ? (
            <div className="courses-meta-value">{certification.ownerUnit || "-"}</div>
          ) : (
            <select
              className="form-select ds-select"
              value={generalForm.ownerUnit}
              onChange={(e) =>
                setGeneralForm((p) => ({ ...p, ownerUnit: e.target.value }))
              }
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

      {isEditingGeneral && (
        <div className="d-flex justify-content-end gap-2 mt-4">
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
          </button>
        </div>
      )}

      <hr className="my-4" />

{/* =========================
          REQUERIMIENTOS
         ========================= */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h6 style={{ fontWeight: 900, margin: 0 }}>Requerimientos</h6>

        {/* Opción B: link discreto que activa fila al final */}
        {!addingReq && editingReqId === null && (
          <button
            type="button"
            className="btn btn-link d-inline-flex align-items-center gap-2 ds-add-link"
            onClick={startAddRequirement}
            title="Agregar requerimiento"
          >
            <span>Agregar requerimiento</span>
            <i className="bi bi-plus-lg"></i>
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

                    <td className="text-left">{typeLabel(r.type)}</td>

                    <td>
                      {!isEditingRow ? (
                        renderReqValue(r)
                      ) : r.type === "CREDITS" ? (
                        <input
                          className="form-control ds-input"
                          type="number"
                          min="0"
                          value={editReqForm.creditsRequired}
                          onChange={(e) =>
                            setEditReqForm((p) => ({
                              ...p,
                              creditsRequired: e.target.value,
                            }))
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
                              setEditReqForm((p) => ({
                                ...p,
                                courseInput: e.target.value,
                              }))
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

                    <td className="text-left">{conditionLabel(r.condition)}</td>

                    <td className="text-center">
                      {!isEditingRow ? (
                        <div className="d-inline-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon d-inline-flex align-items-center justify-content-center"
                            onClick={() => startEditRequirement(r)}
                            title="Editar requerimiento"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>

                          <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon text-danger d-inline-flex align-items-center justify-content-center"
                            onClick={() => handleDeleteRequirement(r.requirementId)}
                            title="Eliminar requerimiento"
                          >
                            <i className="bi bi-trash3"></i>
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

              {/* Add row (al final) */}
              {addingReq && (
                <tr>
                  <td className="text-center">
                    <select
                      className="form-select ds-select"
                      value={reqForm.group}
                      onChange={(e) =>
                        setReqForm((p) => ({
                          ...p,
                          group: Number(e.target.value),
                        }))
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
                          list="courses-datalist-add"
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
                        <datalist id="courses-datalist-add">
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

                  <td className="text-center">
                    <select
                      className="form-select ds-select"
                      value={reqForm.condition}
                      onChange={(e) =>
                        setReqForm((p) => ({ ...p, condition: e.target.value }))
                      }
                      disabled={reqForm.type === "CREDITS"}
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