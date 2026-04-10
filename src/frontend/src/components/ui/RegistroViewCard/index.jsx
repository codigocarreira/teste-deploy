import { useState } from "react";

function getTypeLabel(type) {
  if (type === "axolote") return "Registro de ajolote";
  if (type === "ambiente") return "Registro de ambiente";
  return "Registro";
}

function getStatusLabel(status) {
  if (status === "pendente") return "Pendente";
  if (status === "aprovado" || status === "validado") return "Validado";
  if (status === "reprovado" || status === "recusado") return "Recusado";
  return status;
}

export default function RegistroViewerCard({ record }) {
  const [expanded, setExpanded] = useState(false);

  const fields = record?.data?.fields || {};
  const contextData = Object.entries(record?.data || {}).filter(
    ([key]) => key !== "fields",
  );

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
            <h4>Informações principais</h4>

            <div className="detail-grid">
              {Object.entries(fields).length > 0 ? (
                Object.entries(fields).map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span>{key.replaceAll("_", " ")}</span>
                    <strong>{value}</strong>
                  </div>
                ))
              ) : (
                <div className="detail-item">
                  <span>Informações</span>
                  <strong>Sem detalhes disponíveis</strong>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h4>Contexto do registro</h4>

            <div className="detail-grid">
              {contextData.length > 0 ? (
                contextData.map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span>{key.replaceAll("_", " ")}</span>
                    <strong>{String(value)}</strong>
                  </div>
                ))
              ) : (
                <div className="detail-item">
                  <span>Contexto</span>
                  <strong>Sem contexto disponível</strong>
                </div>
              )}
            </div>
          </div>

          <div className="viewer-mode-box">
            Modo de visualização. Este painel mostra os registros existentes sem
            ações de validação.
          </div>
        </div>
      )}
    </article>
  );
}
