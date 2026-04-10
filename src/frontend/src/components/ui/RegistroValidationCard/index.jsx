import { useState } from "react";
import "./styles.css";

function getTypeLabel(type) {
  if (type === "axolote") return "Registro de ajolote";
  if (type === "ambiente") return "Registro de ambiente";
  return "Registro";
}

function getStatusLabel(status) {
  if (status === "pendente") return "Pendiente";
  if (status === "aprovado") return "Aprobado";
  if (status === "reprovado") return "Rechazado";
  return status;
}

export default function RegistroValidationCard({
  record,
  userRole = "operador",
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
}) {
  const [expanded, setExpanded] = useState(false);

  const isValidator = userRole === "auditor";
  const isPending = record.status === "pendente";
  const isActionLoading = isApproving || isRejecting;

  return (
    <article className={`validation-card ${expanded ? "expanded" : ""}`}>
      <button
        type="button"
        className="validation-card-header"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="validation-card-main">
          <div className="validation-card-topline">
            <span className={`type-badge ${record.type}`}>
              {getTypeLabel(record.type)}
            </span>
            <span className={`status-badge ${record.status}`}>
              {getStatusLabel(record.status)}
            </span>
          </div>

          <h3>{record.title}</h3>
          <p>{record.summary}</p>

          <div className="validation-card-meta">
            <span>
              <strong>ID:</strong> {record.id}
            </span>
            <span>
              <strong>Vínculo:</strong> {record.linkedEntity}
            </span>
            <span>
              <strong>Criado por:</strong> {record.createdBy}
            </span>
            <span>
              <strong>Data:</strong> {record.createdAt}
            </span>
          </div>
        </div>

        <div className="validation-card-expand">
          <span>{expanded ? "−" : "+"}</span>
        </div>
      </button>

      {expanded && (
        <div className="validation-card-body">
          <div className="detail-section">
            <h4>Informaciones principales</h4>

            <div className="detail-grid">
              {Object.entries(record.data.fields).map(([key, value]) => (
                <div key={key} className="detail-item">
                  <span>{key.replaceAll("_", " ")}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h4>Contexto del registro</h4>

            <div className="detail-grid">
              {Object.entries(record.data)
                .filter(([key]) => key !== "fields")
                .map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span>{key.replaceAll("_", " ")}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
            </div>
          </div>

          <div className="validation-card-actions">
            {isValidator ? (
              <>
                <button
                  type="button"
                  className="ghost-btn danger"
                  onClick={() => onReject(record)}
                  disabled={!isPending || isActionLoading}
                >
                  {isRejecting ? "Rechazando..." : "Rechazar"}
                </button>

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => onApprove(record)}
                  disabled={!isPending || isActionLoading}
                >
                  {isApproving ? "Validando..." : "Validar"}
                </button>
              </>
            ) : (
              <div className="viewer-mode-box">
                Modo de visualización. Solo los auditores pueden validar o
                rechazar registros.
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
