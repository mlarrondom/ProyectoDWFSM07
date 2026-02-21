import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { totalCount } = useCart();

  return (
<NavLink
  to="/cart"
  className={({ isActive }) =>
    `ds-cart-link position-relative d-inline-flex align-items-center ${isActive ? "is-active" : ""}`
  }
  title="Carrito"
>
  <i className="bi bi-cart3 fs-5"></i>

  {totalCount > 0 && (
    <span
      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      aria-label={`Productos en carrito: ${totalCount}`}
      style={{ fontSize: "0.65rem" }}
    >
      {totalCount}
    </span>
  )}
</NavLink>
  );
}
