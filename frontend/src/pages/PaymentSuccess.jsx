import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
  const { clearCart } = useCart();

  // limpiamos carrito cuando el pago fue exitoso
  clearCart();

  return (
    <div className="ds-card p-4 text-center">
      <h3 className="mb-3">Pago aprobado 🎉</h3>
      <p className="text-muted">Tu compra fue procesada correctamente.</p>

      <Link to="/catalog" className="btn btn-primary mt-3">
        Volver al catálogo
      </Link>
    </div>
  );
}
