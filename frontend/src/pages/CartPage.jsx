import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const formatCLP = (n) =>
  (Number(n) || 0).toLocaleString("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice } = useCart();

  return (
    <div className="d-flex flex-column gap-3">
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h3 className="m-0">Carrito</h3>
          <div className="text-muted">Revisa tus certificaciones antes de pagar.</div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/catalog" className="btn btn-outline-secondary">
            Seguir comprando
          </Link>
          <button type="button" className="btn btn-outline-danger" onClick={clearCart} disabled={items.length === 0}>
            Vaciar
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info m-0">Tu carrito está vacío.</div>
      ) : (
        <>
          <div className="ds-card p-3">
            <div className="table-responsive">
              <table className="table align-middle m-0">
                <thead>
                  <tr>
                    <th>Certificación</th>
                    <th>Sede</th>
                    <th className="text-end">Precio</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.certCode}>
                      <td>
                        <div className="fw-semibold">{it.name}</div>
                        <div className="text-muted small">Código: {it.certCode}</div>
                      </td>
                      <td>{it.campus}</td>
                      <td className="text-end">{formatCLP(it.price)}</td>
                      <td className="text-center">{it.quantity ?? 1}</td>
                      <td className="text-end">{formatCLP((Number(it.price) || 0) * (it.quantity ?? 1))}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeItem(it.certCode)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <div className="ds-card p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div className="fw-semibold">Total</div>
                <div className="fw-bold">{formatCLP(totalPrice)}</div>
              </div>

              <div className="text-muted small mt-2">Próximo paso: Checkout (lo implementamos en el siguiente paso).</div>

              <button type="button" className="btn btn-primary w-100 mt-3" disabled>
                Pagar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
