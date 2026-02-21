import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';

const API = import.meta.env.VITE_API_URL;

export default function Catalog() {
    const [certifications, setCertifications] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { addItem } = useCart();

    // filtro binario por sede
    const [campus, setCampus] = useState('Santiago');

    // filtro texto (nombre o unidad)
    const [search, setSearch] = useState('');

    // ===== Modal requerimientos (solo lectura) =====
    const [openReq, setOpenReq] = useState(false);
    const [selectedCert, setSelectedCert] = useState(null); // { certCode, name, ... }
    const [reqLoading, setReqLoading] = useState(false);
    const [reqError, setReqError] = useState('');
    const [reqs, setReqs] = useState([]);

    const load = async () => {
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API}/api/certifications`);
            const data = await res.json();

            if (!res.ok) {
                setError(data?.msg || 'Error cargando certificaciones');
                setCertifications([]);
                return;
            }

            setCertifications(data?.certifications || []);
        } catch {
            setError('Error de conexión');
            setCertifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const campusTotal = useMemo(() => {
        return certifications.filter((c) => c.campus === campus).length;
    }, [certifications, campus]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();

        return certifications
            .filter((c) => c.campus === campus)
            .filter((c) => {
                if (!q) return true;
                const name = String(c.name || '').toLowerCase();
                const unit = String(c.ownerUnit || 'Sin unidad').toLowerCase();
                return name.includes(q) || unit.includes(q);
            })
            .sort((a, b) => (a.certCode || 0) - (b.certCode || 0));
    }, [certifications, campus, search]);

    // agrupar por unidad
    const groupedByUnit = useMemo(() => {
        const acc = {};
        for (const c of filtered) {
            const key = c.ownerUnit || 'Sin unidad';
            if (!acc[key]) acc[key] = [];
            acc[key].push(c);
        }
        return acc;
    }, [filtered]);

    const unitEntries = useMemo(() => {
        return Object.entries(groupedByUnit).sort(([a], [b]) => a.localeCompare(b));
    }, [groupedByUnit]);

    const formatCLP = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return '-';
        return n.toLocaleString('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        });
    };

    // ========= Modal logic =========
    const closeReqModal = () => {
        setOpenReq(false);
        setSelectedCert(null);
        setReqError('');
        setReqs([]);
        setReqLoading(false);
    };

    const openReqModal = async (cert) => {
        setSelectedCert(cert);
        setOpenReq(true);
        setReqError('');
        setReqs([]);

        try {
            setReqLoading(true);
            const res = await fetch(`${API}/api/certifications/${cert.certCode}/requirements`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data?.msg || 'No se pudieron cargar los requerimientos');
            }

            setReqs(data?.requirements || []);
        } catch (e) {
            setReqError(e.message || 'Error cargando requerimientos');
        } finally {
            setReqLoading(false);
        }
    };

    // ========= ViewModel requerimientos (checklist) =========
    const reqViewModel = useMemo(() => {
        // requirement de créditos (si existe)
        const creditsReq = reqs.find((r) => r.type === 'CREDITS');
        const creditsNeeded = creditsReq?.creditsRequired;

        // requirements de cursos, agrupados por group (NÚMERO)
        const courseReqs = reqs.filter((r) => r.type === 'COURSE');

        const byGroup = new Map();
        for (const r of courseReqs) {
            const g = Number(r.group); // 🔑 evita duplicados por "2" vs 2
            if (!byGroup.has(g)) byGroup.set(g, []);
            byGroup.get(g).push(r);
        }

        const requirementsChecklist = Array.from(byGroup.entries())
            .sort(([a], [b]) => a - b)
            .map(([group, items]) => {
                const allMandatory = items.every((x) => x.condition === 'Y');

                const title = allMandatory
                    ? 'Tienes que realizar las siguientes asignaturas:'
                    : 'Tienes que realizar las asignaturas que tú elijas hasta cumplir con los créditos del requisito 1:';

                const courses = items
                    .map((x) => ({
                        requirementId: x.requirementId,
                        code: x?.course?.courseCode || x.courseCode || '-',
                        name: x?.course?.name || '-',
                        credits: x?.course?.credits ?? '-',
                    }))
                    .sort((a, b) => String(a.code).localeCompare(String(b.code)));

                return { group, title, courses };
            });

        return { creditsNeeded, requirementsChecklist };
    }, [reqs]);

    return (
        <div className="container py-3">
            {/* Header + filtro binario */}
            <div className="catalog-toolbar">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                    <div>
                        <h2 className="m-0 catalog-title">Catálogo de Certificaciones</h2>
                    </div>

                    <div className="ds-campus-toggle" role="group" aria-label="Filtro por sede">
                        <button
                            type="button"
                            className={`ds-campus-option ${campus === 'Santiago' ? 'is-active' : ''}`}
                            onClick={() => setCampus('Santiago')}
                        >
                            Santiago
                        </button>

                        <button
                            type="button"
                            className={`ds-campus-option ${campus === 'Concepción' ? 'is-active' : ''}`}
                            onClick={() => setCampus('Concepción')}
                        >
                            Concepción
                        </button>
                    </div>
                </div>
            </div>

            {loading && <div className="alert alert-info mt-3">Cargando catálogo...</div>}
            {error && <div className="alert alert-danger mt-3">{error}</div>}

            {!loading && !error && (
                <div className="ds-card mt-3 catalog-surface">
                    <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between">
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                            <input
                                className="form-control ds-filter-input"
                                placeholder="Filtrar por nombre o unidad..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ minWidth: 320 }}
                            />

                            {search && (
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setSearch('')}
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        <div className="text-muted">
                            Mostrando <b>{filtered.length}</b> de <b>{campusTotal}</b>
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <div className="alert alert-secondary mt-3 mb-0">
                            No hay certificaciones para <b>{campus}</b> con los filtros actuales.
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-4 mt-3">
                            {unitEntries.map(([unit, certs]) => (
                                <section key={unit} className="catalog-area">
                                    <div className="d-flex align-items-center justify-content-between mb-2">
                                        <h5 className="m-0 catalog-area-title">{unit}</h5>
                                        <small className="text-muted">
                                            {certs.length}{' '}
                                            {certs.length === 1
                                                ? 'certificación'
                                                : 'certificaciones'}
                                        </small>
                                    </div>

                                    <div className="row g-3">
                                        {certs.map((cert) => (
                                            <div
                                                className="col-12 col-md-6 col-lg-4"
                                                key={cert.certCode}
                                            >
                                                <div className="ds-card catalog-card h-100">
                                                    <div className="d-flex flex-column h-100">
                                                        <div className="d-flex justify-content-between align-items-start gap-2">
                                                            <h6 className="m-0 catalog-card-title">
                                                                {cert.name}
                                                            </h6>

                                                            <span
                                                                className="catalog-badge"
                                                                title="Código certificación"
                                                            >
                                                                {cert.certCode}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2 text-muted catalog-meta">
                                                            <div>
                                                                <b>Sede:</b> {cert.campus}
                                                            </div>
                                                            <div>
                                                                <b>Precio:</b>{' '}
                                                                {formatCLP(cert.price ?? 0)}
                                                            </div>
                                                        </div>

                                                        <div className="mt-auto pt-3 d-flex gap-2">
                                                            {/* ✅ Abre modal */}
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline-secondary"
                                                                onClick={() => openReqModal(cert)}
                                                            >
                                                                Ver detalle
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-cta d-inline-flex align-items-center gap-2"
                                                                onClick={() =>
                                                                    addItem({
                                                                        certCode: cert.certCode,
                                                                        name: cert.name,
                                                                        campus: cert.campus,
                                                                        price: cert.price ?? 0,
                                                                        quantity: 1,
                                                                    })
                                                                }
                                                            >
                                                                Agregar{' '}
                                                                <i className="bi bi-cart-plus"></i>
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
                    )}
                </div>
            )}

            {/* =======================
          MODAL: REQUERIMIENTOS (solo lectura)
         ======================= */}
            {openReq && (
                <div className="ds-modal-backdrop" onClick={closeReqModal}>
                    <div className="ds-modal ds-modal-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="ds-modal-header">
                            <h5 className="ds-modal-title m-0">
                                {selectedCert?.name?.toUpperCase() || 'DETALLE'}
                            </h5>

                            {/* X */}
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Cerrar"
                                onClick={closeReqModal}
                            />
                        </div>

                        <div className="ds-modal-body">
                            {reqLoading ? (
                                <div className="alert alert-info">Cargando requerimientos...</div>
                            ) : reqError ? (
                                <div className="alert alert-danger">{reqError}</div>
                            ) : (
                                <>
                                    {/* Texto guía */}
                                    <div className="mb-3" style={{ fontWeight: 700 }}>
                                        Para obtener esta certificación, debes completar los
                                        siguientes requisitos:
                                    </div>

                                    {/* Requisito 1: Créditos */}
                                    {reqViewModel.creditsNeeded != null && (
                                        <div className="ds-card mb-3" style={{ padding: 14 }}>
                                            <div className="d-flex align-items-start gap-2">
                                                <i class="bi bi-check2-circle"></i>
                                                <div>
                                                    <div style={{ fontWeight: 800 }}>
                                                        Requisito 1
                                                    </div>
                                                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                                                        Tienes que completar{' '}
                                                        <span style={{ fontWeight: 900 }}>
                                                            {reqViewModel.creditsNeeded}
                                                        </span>{' '}
                                                        créditos
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Requisito 2/3: Asignaturas agrupadas */}
                                    {reqViewModel.requirementsChecklist.length === 0 ? (
                                        <div className="alert alert-secondary">
                                            Esta certificación no tiene requerimientos de
                                            asignaturas.
                                        </div>
                                    ) : (
                                        <div className="d-flex flex-column gap-3">
                                            {reqViewModel.requirementsChecklist.map((sec, idx) => (
                                                <div
                                                    key={sec.group}
                                                    className="ds-card"
                                                    style={{ padding: 14 }}
                                                >
                                                    <div className="d-flex align-items-start gap-2">
                                                        <i class="bi bi-check2-circle"></i>
                                                        <div className="w-100">
                                                            <div style={{ fontWeight: 800 }}>
                                                                Requisito {idx + 2}
                                                            </div>

                                                            <div
                                                                style={{
                                                                    fontWeight: 800,
                                                                    marginBottom: 6,
                                                                }}
                                                            >
                                                                {sec.title}
                                                            </div>

                                                            <div className="table-responsive">
                                                                <table className="table table-sm align-middle m-0">
                                                                    <thead className="table-light">
                                                                        <tr>
                                                                            <th
                                                                                style={{
                                                                                    width: 120,
                                                                                }}
                                                                                className="text-center"
                                                                            >
                                                                                Código
                                                                            </th>
                                                                            <th>Asignatura</th>
                                                                            <th
                                                                                style={{
                                                                                    width: 120,
                                                                                }}
                                                                                className="text-center"
                                                                            >
                                                                                Créditos
                                                                            </th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {sec.courses.map((c) => (
                                                                            <tr
                                                                                key={`${c.code}-${c.requirementId || ''}`}
                                                                            >
                                                                                <td
                                                                                    className="text-center"
                                                                                    style={{
                                                                                        fontWeight: 800,
                                                                                    }}
                                                                                >
                                                                                    {c.code}
                                                                                </td>
                                                                                <td>{c.name}</td>
                                                                                <td className="text-center">
                                                                                    {c.credits}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
