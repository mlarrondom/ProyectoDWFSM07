import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { totalCount } = useCart();

  return (
    <NavLink
      to="/cart"
      className={({ isActive }) =>
        `ds-cart-link d-flex align-items-center justify-content-between ${isActive ? "is-active" : ""}`
      }
      title="Carrito"
    >
      Carrito <i className="bi bi-cart3 ms-2"></i>

      {totalCount > 0 && (
        <span className="badge text-bg-light ms-2" aria-label={`Productos en carrito: ${totalCount}`}>
          {totalCount}
        </span>
      )}
    </NavLink>
  );
}
