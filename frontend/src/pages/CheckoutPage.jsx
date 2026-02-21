import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createPreference } from '../services/paymentsApi';
import { useClientAuth } from '../context/ClientAuthContext';

const API = import.meta.env.VITE_API_URL;

const formatCLP = (n) =>
    (Number(n) || 0).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    });

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(String(email).trim());
}

/**
 * Teléfono Chile (MVP):
 * - Acepta: +56 9XXXXXXXX
 * - Acepta: 56 9XXXXXXXX
 * - Acepta: 9XXXXXXXX
 * Normaliza a +56 9XXXXXXXX
 */
function normalizeChilePhone(input) {
    const raw = String(input || '').trim();
    const cleaned = raw.replace(/[^\d+]/g, '');

    if (/^\+56\d{9}$/.test(cleaned)) return cleaned; // +569XXXXXXXX
    if (/^56\d{9}$/.test(cleaned)) return `+${cleaned}`; // 569XXXXXXXX
    if (/^9\d{8}$/.test(cleaned)) return `+56${cleaned}`; // 9XXXXXXXX

    return null;
}

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, totalPrice, clearCart } = useCart();
    const { clientToken, client } = useClientAuth();

    useEffect(() => {
        if (!items || items.length === 0) navigate('/cart', { replace: true });
    }, [items, navigate]);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneRaw, setPhoneRaw] = useState('');

    const [touched, setTouched] = useState({
        fullName: false,
        email: false,
        phone: false,
    });
    const [submitted, setSubmitted] = useState(false);

    // para simulación
    const [lastExternalReference, setLastExternalReference] = useState(
        () => sessionStorage.getItem('certify_last_external_reference') || ''
    );
    const [simLoading, setSimLoading] = useState(false);

    useEffect(() => {
        // Si está logueado como cliente, prellenar
        if (client) {
            setFullName((prev) => prev || client.fullName || '');
            setEmail((prev) => prev || client.email || '');
            setPhoneRaw((prev) => prev || client.phone || '');
        }
    }, [client]);

    const phoneNormalized = useMemo(() => normalizeChilePhone(phoneRaw), [phoneRaw]);

    const errors = useMemo(() => {
        const e = {};
        if (fullName.trim().length < 5) e.fullName = 'Ingresa tu nombre completo.';
        if (!isValidEmail(email)) e.email = 'Ingresa un email válido.';
        if (!phoneNormalized) e.phone = 'Teléfono inválido. Usa 9XXXXXXXX o +56 9XXXXXXXX.';
        return e;
    }, [fullName, email, phoneNormalized]);

    const isValid = Object.keys(errors).length === 0;

    const showError = (field) => submitted || touched[field];

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(String(text));
        } catch {
            // fallback simple
            alert('No se pudo copiar al portapapeles.');
        }
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitted(true);

        if (!isValid) return;

        const buyer = {
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phoneNormalized,
        };

        try {
            const payload = { items, buyer };
            const resp = await createPreference(payload, clientToken);

            const initPoint = resp?.initPoint;
            const externalReference = resp?.externalReference;

            if (!initPoint) throw new Error('Mercado Pago no devolvió initPoint');
            if (!externalReference) throw new Error('No se pudo obtener externalReference');

            sessionStorage.setItem('certify_last_external_reference', externalReference);
            setLastExternalReference(externalReference);

            window.open(initPoint, '_blank', 'noopener,noreferrer');

            if (!initPoint) throw new Error('Mercado Pago no devolvió initPoint');

            // guardamos para poder simular cierre desde CERTIFY
            if (externalReference) {
                sessionStorage.setItem('certify_last_external_reference', externalReference);
                setLastExternalReference(externalReference);
            }

            // abre MP en otra pestaña para mantener CERTIFY abierto
            window.open(initPoint, '_blank', 'noopener,noreferrer');
        } catch (err) {
            console.error(err);
            alert(err.message || 'No se pudo iniciar el pago');
        }
    };

    const handleSimulatePaid = () => {
        const ext = sessionStorage.getItem('certify_last_external_reference');

        if (!ext) {
            alert('Primero debes iniciar el pago.');
            return;
        }

        navigate(`/payment/success?external_reference=${encodeURIComponent(ext)}&status=approved`);
    };

    return (
        <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
                <div>
                    <h3 className="m-0">Checkout</h3>
                    <div className="text-muted">Completa tus datos para continuar con el pago</div>
                </div>

                <Link to="/cart" className="btn btn-outline-secondary">
                    Volver al carrito
                </Link>
            </div>

            {/* Resumen */}
            <div className="ds-card p-3">
                <div className="fw-semibold mb-2">Resumen</div>

                <div className="d-flex flex-column gap-2">
                    {items.map((it) => (
                        <div key={it.certCode} className="d-flex justify-content-between gap-2">
                            <div className="text-truncate">
                                <span className="fw-semibold">{it.name}</span>{' '}
                                <span className="text-muted small">({it.campus})</span>
                                {(it.quantity ?? 1) > 1 && (
                                    <span className="text-muted small"> x{it.quantity}</span>
                                )}
                            </div>
                            <div className="fw-semibold">
                                {formatCLP((Number(it.price) || 0) * (it.quantity ?? 1))}
                            </div>
                        </div>
                    ))}

                    <div className="d-flex justify-content-between border-top pt-2 mt-1">
                        <div className="fw-bold">Total</div>
                        <div className="fw-bold">{formatCLP(totalPrice)}</div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form className="ds-card p-3" onSubmit={handleSubmit} noValidate>
                <div className="fw-semibold mb-3">Datos del comprador</div>

                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label">Nombre completo</label>
                        <input
                            className={`form-control ${
                                showError('fullName') && errors.fullName ? 'is-invalid' : ''
                            }`}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                            placeholder="Ej: Mauricio Larrondo"
                            autoComplete="name"
                        />
                        {showError('fullName') && errors.fullName && (
                            <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label">Email</label>
                        <input
                            className={`form-control ${
                                showError('email') && errors.email ? 'is-invalid' : ''
                            }`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            placeholder="ejemplo@correo.com"
                            autoComplete="email"
                        />
                        {showError('email') && errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                        )}
                    </div>

                    <div className="col-12 col-md-6">
                        <label className="form-label">Teléfono (Chile)</label>
                        <input
                            className={`form-control ${
                                showError('phone') && errors.phone ? 'is-invalid' : ''
                            }`}
                            value={phoneRaw}
                            onChange={(e) => setPhoneRaw(e.target.value)}
                            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                            placeholder="9XXXXXXXX o +56 9XXXXXXXX"
                            autoComplete="tel"
                        />
                        {showError('phone') && errors.phone && (
                            <div className="invalid-feedback">{errors.phone}</div>
                        )}

                        {!errors.phone && phoneRaw && phoneNormalized && (
                            <div className="form-text">Se usará: {phoneNormalized}</div>
                        )}
                    </div>
                </div>

                {/* BOTONES: mantener Continuar pago abajo derecha + alternativo debajo */}
                <div className="d-flex justify-content-end mt-3">
                    <div className="d-flex flex-column align-items-end gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={items.length === 0}
                        >
                            Continuar pago
                        </button>

                        <button
                            type="button"
                            className="btn btn-link text-muted p-0"
                            onClick={handleSimulatePaid}
                            disabled={simLoading}
                            title="Solo demo local (sandbox)"
                        >
                            {simLoading ? 'Procesando...' : 'Simular pago completado'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Datos prueba Mercado Pago (nuevo, sin romper nada) */}
            <div className="ds-card p-3">
                <div className="fw-semibold mb-2">Datos de prueba Mercado Pago (sandbox)</div>

                <div className="d-flex flex-column gap-2">
                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="text-muted">
                            Usuario:{' '}
                            <span className="text-body fw-semibold">
                                TESTUSER5488271202124680212
                            </span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon"
                            onClick={() => copyToClipboard('TESTUSER5488271202124680212')}
                            title="Copiar usuario"
                        >
                            <i className="bi bi-copy"></i>
                        </button>
                    </div>

                    <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="text-muted">
                            Contraseña: <span className="text-body fw-semibold">MEnYTcWRH7</span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-link btn-ghost btn-icon"
                            onClick={() => copyToClipboard('MEnYTcWRH7')}
                            title="Copiar contraseña"
                        >
                            <i className="bi bi-copy"></i>
                        </button>
                    </div>

                    <div className="text-muted small">
                        Se abrirá Mercado Pago en otra pestaña. Si el retorno automático no ocurre
                        en localhost, puedes usar el botón alternativo de simulación (solo demo).
                    </div>
                </div>
            </div>
        </div>
    );
}
