import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientAuth } from "../context/ClientAuthContext";

export default function Signup() {
    const navigate = useNavigate();
    const { clientLogin } = useClientAuth();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("+56");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: fullName.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    password,
                }),
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.msg || data?.message || "No se pudo crear la cuenta");
                setSubmitting(false);
                return;
            }

            const jwt = data?.token;
            if (!jwt) {
                setError("No llegó token desde el backend");
                setSubmitting(false);
                return;
            }

            clientLogin(jwt, data?.client);
            navigate("/me");
        } catch {
            setError("Error de red. Intenta nuevamente.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-5 d-flex justify-content-center">
            <div className="ds-card p-4" style={{ maxWidth: 420, width: "100%" }}>
                <h2 className="text-center mb-3">Crear cuenta</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Nombre completo</label>
                        <input
                            className="form-control"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            autoComplete="name"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Teléfono (Chile)</label>
                        <input
                            className="form-control"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+569XXXXXXXX"
                            autoComplete="tel"
                        />
                        <div className="form-text">Formato esperado: +569XXXXXXXX</div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="d-flex justify-content-center">
                        <button type="submit" className="btn btn-cta px-4" disabled={submitting}>
                            {submitting ? "Creando..." : "Crear cuenta"}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-3">
                    <span className="text-muted">¿Ya tienes cuenta?</span>{" "}
                    <button
                        type="button"
                        className="btn btn-link p-0 align-baseline"
                        onClick={() => navigate("/login")}
                        disabled={submitting}
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        </div>
    );
}