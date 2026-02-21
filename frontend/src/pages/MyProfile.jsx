import { useEffect, useMemo, useState } from 'react';
import { useClientAuth } from '../context/ClientAuthContext';

const API = import.meta.env.VITE_API_URL;

export default function MyProfile() {
    const { client, clientToken, verifyClient } = useClientAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const clientId = useMemo(() => client?.id || client?._id || null, [client]);

    useEffect(() => {
        setFullName(client?.fullName || '');
        setEmail(client?.email || '');
        setPhone(client?.phone || '');
    }, [clientId, client]);

    const loadPurchases = async () => {
        setLoadingPurchases(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/clients/me/purchases`, {
                headers: { Authorization: `Bearer ${clientToken}` },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.msg || 'No se pudieron cargar las compras');
                return;
            }

            setPurchases(Array.isArray(data?.purchases) ? data.purchases : []);
        } catch {
            setError('Error de red cargando compras');
        } finally {
            setLoadingPurchases(false);
        }
    };

    useEffect(() => {
        if (clientToken) loadPurchases();
    }, [clientToken]);

    const handleCancelPurchase = async (id) => {
        if (!window.confirm('¿Cancelar esta compra pendiente?')) return;

        try {
            const res = await fetch(`${API}/api/clients/me/purchases/${id}/cancel`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${clientToken}`,
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                alert(data?.msg || 'No se pudo cancelar');
                return;
            }

            await loadPurchases();
        } catch {
            alert('Error de red cancelando compra');
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const body = {
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim(),
            };

            if (password.trim().length > 0) body.password = password;

            const res = await fetch(`${API}/api/clients/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${clientToken}`,
                },
                body: JSON.stringify(body),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.msg || 'No se pudo guardar');
                return;
            }

            setPassword('');
            setSuccess('Perfil actualizado correctamente');
            setEditing(false);
            await verifyClient();
        } catch {
            setError('Error de red. Intenta nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container my-4">
            <div className="ds-card p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h2 className="mb-0">Mi Perfil</h2>

                    {!editing && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-flex align-items-center gap-2"
                            onClick={() => setEditing(true)}
                        >
                            <span>Editar</span>
                            <i className="bi bi-pencil-square"></i>
                        </button>
                    )}
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="row g-3">
                    <div className="col-12 col-md-6">
                        <label className="form-label">Nombre completo</label>
                        <input
                            className="form-control"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!editing}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={!editing}
                        />
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label">Teléfono</label>
                        <input
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!editing}
                        />
                    </div>

                    {editing && (
                        <>
                            <div className="col-12 col-md-6">
                                <label className="form-label">Nueva password (opcional)</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Dejar vacío para no cambiar"
                                />
                            </div>

                            <div className="col-12">
                                <div className="d-flex justify-content-end gap-2 mt-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setEditing(false);
                                            setPassword('');
                                        }}
                                        disabled={saving}
                                    >
                                        Cancelar
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-cta"
                                        onClick={handleSave}
                                        disabled={saving}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <hr className="my-4" />

                <div className="d-flex align-items-center justify-content-between">
                    <h3 className="mb-0">Mis certificaciones</h3>

                    <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2"
                        onClick={loadPurchases}
                        disabled={loadingPurchases}
                    >
                        <span>{loadingPurchases ? 'Refrescando...' : 'Refrescar'}</span>
                        <i className="bi bi-arrow-clockwise"></i>
                    </button>
                </div>

                <div className="mt-3">
                    {loadingPurchases ? (
                        <div className="text-muted">Cargando...</div>
                    ) : purchases.length === 0 ? (
                        <div className="text-muted">Aún no tienes compras registradas.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Estado</th>
                                        <th>Monto</th>
                                        <th>Items</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {purchases
                                        .filter((p) => p.status !== 'cancelled')
                                        .map((p) => (
                                            <tr key={p._id}>
                                                <td>{new Date(p.createdAt).toLocaleString()}</td>
                                                <td>{p.status}</td>
                                                <td>${Number(p.amount).toLocaleString('es-CL')}</td>
                                                <td>
                                                    {(p.items || []).map((it, idx) => (
                                                        <div key={`${p._id}-${idx}`}>
                                                            {it.certCode} · {it.name}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td>
                                                    {p.status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            className="btn btn-link btn-ghost d-inline-flex align-items-center justify-content-center btn-icon text-danger"
                                                            onClick={() =>
                                                                handleCancelPurchase(p._id)
                                                            }
                                                            title="Cancelar compra pendiente"
                                                        >
                                                            <i className="bi bi-trash3"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
