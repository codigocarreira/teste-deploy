import "./styles.css";

export default function StatusModal({
  isOpen,
  type = "success",
  title,
  message,
  confirmLabel = "Continuar",
  onConfirm,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="status-modal-overlay" onClick={onClose}>
      <div
        className={`status-modal ${type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="status-modal-icon">
          {type === "success" ? "✓" : "!"}
        </div>

        <div className="status-modal-content">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>

        <div className="status-modal-actions">
          <button
            type="button"
            className="status-modal-button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
