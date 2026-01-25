import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

export default function CertificationDetail() {
  const { certCode } = useParams();
  const { token } = useAuth();
  const [certification, setCertification] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/certifications/${certCode}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCertification(data.certification))
      .catch(() => setError("Error cargando certificación"));
  }, [certCode, token]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!certification) return <div className="alert alert-secondary">Cargando...</div>;

  return (
    <div>
      <div className="mb-3">
        <Link className="btn btn-outline-secondary btn-sm" to="/certifications">
          ← Volver
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <h3 className="card-title">{certification.name}</h3>

          <div className="row mt-3">
            <div className="col-md-3">
              <small className="text-muted">Código</small>
              <div>{certification.certCode}</div>
            </div>

            <div className="col-md-3">
              <small className="text-muted">Campus</small>
              <div>{certification.campus}</div>
            </div>

            <div className="col-md-6">
              <small className="text-muted">Unidad</small>
              <div>{certification.ownerUnit}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
