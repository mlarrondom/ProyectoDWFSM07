import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();               
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.msg || "Credenciales inválidas");
        setSubmitting(false);
        return;                       
      }

      const jwt = data?.token || data?.jwt || data?.accessToken;
      if (!jwt) {
        setError("No llegó token desde el backend");
        setSubmitting(false);
        return;
      }

      login(jwt);                     
      navigate("/admin/certifications"); 

    } catch {
      setError("Error de red. Intenta nuevamente.");
      setSubmitting(false);
    }
  };

  return (
    <div className="container my-5" style={{ maxWidth: 480 }}>
      <h2 style={{ color: "#006699" }}>Login</h2>

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

        <button
          type="submit"               
          className="btn"
          style={{ background: "#FF6600", color: "white", borderRadius: 8 }}
          disabled={submitting}
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
