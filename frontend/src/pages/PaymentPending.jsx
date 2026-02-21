import { Link } from 'react-router-dom';

export default function PaymentPending() {
    return (
        <div className="ds-card p-4 text-center">
            <h3 className="mb-3">Pago pendiente ⏳</h3>
            <p className="text-muted">
                Tu pago está siendo procesado. Te avisaremos cuando se confirme.
            </p>

            <Link to="/catalog" className="btn btn-primary mt-3">
                Volver al catálogo
            </Link>
        </div>
    );
}
