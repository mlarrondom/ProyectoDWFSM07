const API_BASE = import.meta.env.VITE_API_URL; // ej: http://localhost:3000

export async function createPreference({ items, buyer }) {
  if (!API_BASE) throw new Error("Falta VITE_API_URL en el frontend");

  const res = await fetch(`${API_BASE}/api/payments/create-preference`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, buyer }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Error creando preferencia");
  }

  return data; // { initPoint, preferenceId, externalReference }
}