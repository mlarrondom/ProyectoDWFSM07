import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function PaymentSuccess() {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);

    useEffect(() => {
        async function verify() {
            try {
                const externalReference = searchParams.get("external_reference");
                const paymentId = searchParams.get("payment_id");
                const mpStatus = searchParams.get("status");

                if (!externalReference) {
                    setStatus("error");
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/payments/verify?external_reference=${externalReference}&payment_id=${paymentId || ""}&status=${mpStatus || ""}`
                );

                const data = await response.json();

                if (response.ok) {
                    setStatus(data.status);

                    if (data.status === "approved") {
                        clearCart();
                    }
                } else {
                    setStatus("error");
                }
            } catch (error) {
                console.error("Payment verify error:", error);
                setStatus("error");
            } finally {
                setLoading(false);
            }
        }

        verify();
    }, [searchParams, clearCart]);

    if (loading) {
        return (
            <div className="ds-card p-4 text-center">
                <h4>Verificando pago...</h4>
            </div>
        );
    }

    return (
        <div className="ds-card p-4 text-center">
            {status === "approved" && (
                <>
                    <h3 className="mb-3">Pago aprobado <i class="bi bi-check2-circle"></i></h3>
                    <p className="text-muted">
                        Tu compra fue procesada correctamente.
                    </p>
                </>
            )}

            {status === "pending" && (
                <>
                    <h3 className="mb-3">Pago pendiente ⏳</h3>
                    <p className="text-muted">
                        Estamos esperando confirmación del pago.
                    </p>
                </>
            )}

            {status === "rejected" && (
                <>
                    <h3 className="mb-3">Pago rechazado ❌</h3>
                    <p className="text-muted">
                        El pago no fue aprobado.
                    </p>
                </>
            )}

            {status === "error" && (
                <>
                    <h3 className="mb-3">Error verificando pago</h3>
                    <p className="text-muted">
                        No pudimos confirmar el estado.
                    </p>
                </>
            )}

            <Link to="/me" className="btn btn-primary mt-3">
                Ir a mi perfil
            </Link>
        </div>
    );
}