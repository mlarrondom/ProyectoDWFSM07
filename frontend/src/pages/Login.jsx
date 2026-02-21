import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useClientAuth } from "../context/ClientAuthContext";

export default function Login() {
    const { login: adminLogin } = useAuth();
    const { clientLogin } = useClientAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const from = useMemo(() => location.state?.from || null, [location.state]);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const tryLogin = async (endpoint) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json().catch(() => ({}));
        return { res, data };
    };

    const extractJwt = (data) => data?.token || data?.jwt || data?.accessToken;

    const getPostLoginRedirect = () => {
        const stored = sessionStorage.getItem("post_login_redirect");
        if (stored) {
            sessionStorage.removeItem("post_login_redirect");
            return stored;
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            // 1) Intentar Cliente
            const clientAttempt = await tryLogin("/api/auth/login");
            if (clientAttempt.res.ok) {
                const jwt = extractJwt(clientAttempt.data);
                if (!jwt) {
                    setError("No llegó token desde el backend (cliente)");
                    return;
                }

                clientLogin(jwt, clientAttempt.data?.client);

                const redirect = getPostLoginRedirect() || from || "/me";
                navigate(redirect, { replace: true });
                return;
            }

            // 2) Intentar Admin
            const adminAttempt = await tryLogin("/api/user/login");
            if (adminAttempt.res.ok) {
                const jwt = extractJwt(adminAttempt.data);
                if (!jwt) {
                    setError("No llegó token desde el backend (admin)");
                    return;
                }

                adminLogin(jwt);
                navigate("/admin/certifications", { replace: true });
                return;
            }

            // 3) Si ambos fallan, mostrar error (prioriza msg de cliente si viene)
            setError(
                clientAttempt.data?.msg ||
                    clientAttempt.data?.message ||
                    adminAttempt.data?.msg ||
                    adminAttempt.data?.message ||
                    "Credenciales inválidas"
            );
        } catch {
            setError("Error de red. Intenta nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-5 d-flex justify-content-center">
            <div className="ds-card p-4" style={{ maxWidth: 420, width: "100%" }}>
                <h2 className="text-center mb-3">Iniciar Sesión</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="username"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className="d-flex justify-content-center">
                        <button
                            type="submit"
                            className="btn btn-cta px-4"
                            disabled={submitting}
                        >
                            {submitting ? "Ingresando..." : "Ingresar"}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-3">
                    <span className="text-muted">¿Aún no te registras?</span>{" "}
                    <button
                        type="button"
                        className="btn btn-link p-0 align-baseline"
                        onClick={() => navigate("/signup")}
                        disabled={submitting}
                    >
                        Crear cuenta
                    </button>
                </div>
            </div>
        </div>
    );
}