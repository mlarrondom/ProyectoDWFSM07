import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";

const API = import.meta.env.VITE_API_URL;

export default function CertificationsList() {
  const { token } = useAuth();

  const [certifications, setCertifications] = useState([]);
  const [error, setError] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    certCode: "",
    name: "",
    campus: "Santiago",
    ownerUnit: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setError("");
    const res = await fetch(`${API}/api/certifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.msg || "Error cargando certificaciones");
      return;
    }
    setCertifications(data.certifications || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const createCertification = async () => {
    setMsg("");
    setError("");

    // validación mínima
    if (!form.certCode || !form.name || !form.campus || !form.ownerUnit) {
      setError("Completa todos los campos.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/certifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          certCode: Number(form.certCode),
          name: form.name,
          campus: form.campus,
          ownerUnit: form.ownerUnit,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.msg || "Error creando certificación");
        setSaving(false);
        return;
      }

      setMsg("Certificación creada ✅");
      setOpen(false);
      setForm({ certCode: "", name: "", campus: "Santiago", ownerUnit: "" });
      await load();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ds-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="m-0">Certificaciones</h2>
        
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        {certifications.map((cert) => (
          <div className="col-12 col-md-6 col-lg-4" key={cert.certCode}>
            <div className="card ds-card h-100">
              <div className="card-body">
                <h5 className="card-title">{cert.name}</h5>
                <p className="card-text mb-1">
                  <strong>Campus:</strong> {cert.campus}
                </p>
                <p className="card-text">
                  <strong>Unidad:</strong> {cert.ownerUnit}
                </p>

                <Link className="btn btn-primary" to={`/certifications/${cert.certCode}`}>
                  Ver detalle
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal title="Nueva Certificación" open={open} onClose={() => setOpen(false)}>
        <div className="row g-3 mt-1">
          <div className="col-md-4">
            <label className="form-label">Código</label>
            <input
              className="form-control"
              name="certCode"
              value={form.certCode}
              onChange={onChange}
              placeholder="Ej: 2001"
            />
          </div>

          <div className="col-md-8">
            <label className="form-label">Nombre</label>
            <input
              className="form-control"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Nombre de la certificación"
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Campus</label>
            <select className="form-select" name="campus" value={form.campus} onChange={onChange}>
              <option value="Santiago">Santiago</option>
              <option value="Concepción">Concepción</option>
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label">Unidad</label>
            <input
              className="form-control"
              name="ownerUnit"
              value={form.ownerUnit}
              onChange={onChange}
              placeholder="Facultad / Unidad"
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={() => setOpen(false)} disabled={saving}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={createCertification} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
