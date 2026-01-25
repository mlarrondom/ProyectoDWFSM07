export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.35)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="container h-100 d-flex align-items-center justify-content-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white ds-card p-3" style={{ width: "min(720px, 95vw)" }}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="m-0">{title}</h5>
            <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>
              ✕
            </button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
