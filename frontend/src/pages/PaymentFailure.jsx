import { Link } from "react-router-dom";

export default function PaymentFailure() {
  return (
    <div className="ds-card p-4 text-center">
      <h3 className="mb-3 text-danger">Pago rechazado ❌</h3>
      <p className="text-muted">
        El pago no pudo completarse. Puedes intentarlo nuevamente.
      </p>

      <div className="d-flex justify-content-center gap-2 mt-3">
        <Link to="/checkout" className="btn btn-primary">
          Intentar nuevamente
        </Link>

        <Link to="/cart" className="btn btn-outline-secondary">
          Volver al carrito
        </Link>
      </div>
    </div>
  );
}