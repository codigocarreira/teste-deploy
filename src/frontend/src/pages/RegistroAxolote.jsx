import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Header from "../components/layout/Header";
import SectionCard from "../components/layout/Forms/SectionCard";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../config/contracts";
import "../styles/registroNovo.css";
import { useAxolotes } from "../../hooks/useAxolotes";
import { useAquarios } from "../../hooks/useAquarios";
import { useWallet } from "../../context/WalletContext.jsx";
import StatusModal from "../components/ui/StatusModal";
import axoloveRegistro from "../assets/axolove-registro.png";

const initialState = {
  specimen: "",
  linkedTank: "",
  date: "",
  author: "",

  medical: {
    weight: "",
    length: "",
    reason: "",
    alarmSignals: "",
    notes: "",
  },

  feeding: {
    date: "",
    tank: "",
    croquetasAzoo: "",
    croquetasQualispiscis: "",
    tilapiaSalmon: "",
    tubifex: "",
    guppies: "",
    earthworm: "",
    freezeDriedTubifex: "",
    observations: "",
  },

  behavior: {
    date: "",
    startTime: "",
    endTime: "",
    species: "",
    specimen: "",
    tank: "",
    generalActivity: "",
    feeding: "",
    courtship: "",
    socialInteraction: "",
    evidenceUrl: "",
    gillMovements: "",
    alarmSignals: "",
  },

  death: {
    date: "",
    name: "",
    cause: "",
    necropsy: "",
    notes: "",
  },
};

function updateNested(setter, path, value) {
  setter((prev) => {
    const clone = structuredClone(prev);
    const keys = path.split(".");
    let current = clone;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    return clone;
  });
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  options = null,
  full = false,
}) {
  const placeholderMap = {
    date: "Selecciona la fecha",
    time: "Selecciona la hora",
    textarea: "Escribe aquí...",
    number: "Ingresa un valor",
    email: "Ingresa el correo electrónico",
    url: "Pega el enlace aquí",
  };

  const placeholder = placeholderMap[type] || `Ingresa ${label.toLowerCase()}`;

  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>
      {hint && <small>{hint}</small>}

      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{`Selecciona ${label.toLowerCase()}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function RegistroAxolote() {
  const navigate = useNavigate();
  const { walletAddress } = useWallet();
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  //Buscando axolotes e aquarios do banco de dados.
  const { axolotes } = useAxolotes();
  const { aquarios } = useAquarios();

  const selectedSpecimen = useMemo(
    () =>
      axolotes.find((a) => String(a.id) === String(formData.specimen)) || null,
    [formData.specimen, axolotes],
  );

  const selectedTank = useMemo(
    () =>
      aquarios.find(
        (a) =>
          String(a.id) ===
          String(formData.linkedTank || selectedSpecimen?.fk_aquario_id),
      ) || null,
    [formData.linkedTank, selectedSpecimen, aquarios],
  );

  const handleSpecimenChange = (value) => {
    const specimen =
      axolotes.find((a) => String(a.id) === String(value)) || null;

    setFormData((prev) => ({
      ...prev,
      specimen: value,
      linkedTank: specimen?.fk_aquario_id ? String(specimen.fk_aquario_id) : "",
      behavior: {
        ...prev.behavior,
        specimen: value,
        species: specimen?.nome_cientifico || "",
        tank: specimen?.fk_aquario_id ? String(specimen.fk_aquario_id) : "",
      },
      feeding: {
        ...prev.feeding,
        tank: specimen?.fk_aquario_id ? String(specimen.fk_aquario_id) : "",
      },
      death: {
        ...prev.death,
        name: specimen?.especie_apelido || "",
      },
    }));
  };

  const handleTankOverride = (value) => {
    setFormData((prev) => ({
      ...prev,
      linkedTank: value,
      behavior: {
        ...prev.behavior,
        tank: value,
      },
      feeding: {
        ...prev.feeding,
        tank: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        schemaVersion: "1.0.0",
        datasetType: "axolote",
        timestamp: new Date().toISOString(),
        author: formData.author || "Usuario del sistema",

        medicalRecords:
          formData.medical.reason ||
          formData.medical.weight ||
          formData.medical.length
            ? [
                {
                  specimen: formData.specimen,
                  author: formData.author || null,
                  date: formData.date || null,
                  weight: formData.medical.weight || null,
                  length: formData.medical.length || null,
                  reason: formData.medical.reason || null,
                  alarmSignals: formData.medical.alarmSignals || null,
                  notes: formData.medical.notes || null,
                },
              ]
            : [],

        feedingRecords: formData.feeding.date
          ? [
              {
                date: formData.feeding.date,
                author: formData.author || null,
                tank: formData.feeding.tank || null,
                specimen: formData.specimen,
                food: {
                  croquetasAzoo: formData.feeding.croquetasAzoo || null,
                  croquetasQualispiscis:
                    formData.feeding.croquetasQualispiscis || null,
                  tilapiaSalmon: formData.feeding.tilapiaSalmon || null,
                  tubifex: formData.feeding.tubifex || null,
                  guppies: formData.feeding.guppies || null,
                  earthworm: formData.feeding.earthworm || null,
                  freezeDriedTubifex:
                    formData.feeding.freezeDriedTubifex || null,
                },
                observations: formData.feeding.observations || null,
              },
            ]
          : [],

        behaviorRecords: formData.behavior.date
          ? [
              {
                date: formData.behavior.date,
                author: formData.author || null,
                startTime: formData.behavior.startTime || null,
                endTime: formData.behavior.endTime || null,
                species: formData.behavior.species || null,
                specimen: formData.behavior.specimen || null,
                tank: formData.behavior.tank || null,
                intervals: [
                  {
                    time: formData.behavior.startTime || "",
                    generalActivity: formData.behavior.generalActivity || null,
                    feeding: formData.behavior.feeding || null,
                    courtship: formData.behavior.courtship || null,
                    socialInteraction:
                      formData.behavior.socialInteraction || null,
                    evidenceUrl: formData.behavior.evidenceUrl || null,
                  },
                ],
                gillMovements: formData.behavior.gillMovements || null,
                alarmSignals: formData.behavior.alarmSignals || null,
              },
            ]
          : [],

        deathRecords: formData.death.date
          ? [
              {
                date: formData.death.date,
                name: formData.death.name || selectedSpecimen?.alias || "",
                cause: formData.death.cause || null,
                necropsy: formData.death.necropsy || null,
                notes: formData.death.notes || null,
              },
            ]
          : [],
      };

      const response = await fetch("http://localhost:3000/registros/axolote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          axoloteId: formData.specimen,
          operadorId: walletAddress || formData.author,
          dados: payload,
          dataMedicao: formData.date,
        }),
      });

      if (!response.ok) throw new Error("Error al guardar el registro");

      const result = await response.json();

      //Buscando o onchainEntityId do axolote ja cadastrado.
      const axoloteRes = await fetch(
        `http://localhost:3000/axolotes/${formData.specimen}`,
      );
      if (!axoloteRes.ok)
        throw new Error("Ajolote no encontrado en la base de datos");
      const axoloteData = await axoloteRes.json();

      if (!axoloteData.onchain_entity_id) {
        throw new Error(
          "Este ajolote no fue registrado en la blockchain. Regístralo primero mediante el formulario de inserción.",
        );
      }

      //Conectando ao smart contract via MetaMask.
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer,
      );

      //Submetendo record on-chain (popup MetaMask unico).
      const tx = await contract.submitRecord(
        axoloteData.onchain_entity_id,
        result.cid,
      );
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "RecordSubmitted");

      if (!event) {
        throw new Error(
          "No fue posible identificar el ID on-chain del registro.",
        );
      }

      const onchainRecordId = Number(event.args.recordId);

      //Salvando IDs on-chain e tx_hash no banco de dados.
      await fetch(
        `http://localhost:3000/registros/axolote/${result.registro.id}/onchain`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onchainEntityId: Number(axoloteData.onchain_entity_id),
            onchainRecordId,
            txHash: receipt.hash,
          }),
        },
      );

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Registro creado con éxito",
        message: `Registro guardado en IPFS (CID: ${result.cid}) y anclado en la blockchain (tx: ${receipt.hash}).`,
      });
    } catch (error) {
      console.error("Erro ao criar registro de axolote:", error);

      setStatusModal({
        isOpen: true,
        type: "error",
        title: "No fue posible guardar",
        message:
          "Ocurrió un error al crear el registro del ajolote. Revisa los datos e inténtalo nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialState);
    setStatusModal({
      isOpen: false,
      type: "success",
      title: "",
      message: "",
    });
  };

  return (
    <main className="record-page">
      <Header />

      <div className="record-content">
        <div className="record-wrapper">
          <aside className="record-sidebar">
            <div className="record-sidebar-inner">
              <button
                type="button"
                className="record-back-button"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>

              <span className="record-badge">Registro biológico</span>

              <div>
                <h1>Nuevo registro de ajolote</h1>
                <p>
                  Selecciona un ajolote ya registrado, revisa su vínculo con el
                  tanque y registra nuevos datos clínicos, alimentarios,
                  comportamentales o de óbito.
                </p>
              </div>

              <div className="record-image-box">
                <img src={axoloveRegistro} alt="Registro de axolote" />
              </div>

              <div className="record-sidebar-card">
                <strong>Observación</strong>
                <span>
                  Esta pantalla no registra un nuevo ajolote ni un tanque. Solo
                  crea un nuevo registro vinculado a entidades ya existentes.
                </span>
              </div>
            </div>
          </aside>

          <form className="record-main" onSubmit={handleSubmit}>
            <div className="record-main-inner">
              <div className="record-top-card">
                <h2>Selección del ajolote</h2>
                <p>
                  Elige un espécimen ya registrado. El tanque actual se cargará
                  automáticamente y puede ser reemplazado en el registro.
                </p>

                <div className="field-grid" style={{ marginTop: 16 }}>
                  <Field
                    label="Ajolote registrado"
                    value={formData.specimen}
                    onChange={handleSpecimenChange}
                    options={axolotes.map((specimen) => ({
                      value: specimen.id,
                      label: `${specimen.especie_apelido} • ${specimen.cod_exemplar}`,
                    }))}
                  />

                  <Field
                    label="Responsable del registro"
                    value={formData.author}
                    onChange={(value) =>
                      updateNested(setFormData, "author", value)
                    }
                  />

                  <Field
                    label="Tanque vinculado en el registro"
                    value={formData.linkedTank}
                    onChange={handleTankOverride}
                    options={aquarios.map((tank) => ({
                      value: tank.id,
                      label: `${tank.localizacao} • ${tank.codigo_tanque}`,
                    }))}
                  />

                  <Field
                    label="Fecha principal del registro"
                    type="date"
                    value={formData.date}
                    onChange={(value) =>
                      updateNested(setFormData, "date", value)
                    }
                  />
                </div>
              </div>

              <StatusModal
                isOpen={statusModal.isOpen}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                confirmLabel={
                  statusModal.type === "success" ? "Ir al panel" : "Cerrar"
                }
                onClose={() =>
                  setStatusModal((prev) => ({
                    ...prev,
                    isOpen: false,
                  }))
                }
                onConfirm={() => {
                  if (statusModal.type === "success") {
                    navigate("/painelOperador");
                    return;
                  }

                  setStatusModal((prev) => ({
                    ...prev,
                    isOpen: false,
                  }));
                }}
              />

              <SectionCard
                title="Registro médico"
                description="Registra datos clínicos básicos, motivo del seguimiento y señales observadas."
                defaultOpen
              >
                <div className="subsection-box">
                  <h4>Seguimiento clínico</h4>
                  <p>Campos usados en chequeos, tratamiento o emergencia.</p>

                  <div className="field-grid">
                    <Field
                      label="Peso"
                      value={formData.medical.weight}
                      onChange={(v) =>
                        updateNested(setFormData, "medical.weight", v)
                      }
                    />
                    <Field
                      label="Longitud"
                      value={formData.medical.length}
                      onChange={(v) =>
                        updateNested(setFormData, "medical.length", v)
                      }
                    />
                    <Field
                      label="Motivo del registro"
                      value={formData.medical.reason}
                      onChange={(v) =>
                        updateNested(setFormData, "medical.reason", v)
                      }
                      options={[
                        { value: "routine", label: "Rutina" },
                        { value: "illness", label: "Enfermedad" },
                        { value: "emergency", label: "Emergencia" },
                        { value: "treatment", label: "Tratamiento" },
                      ]}
                    />
                    <Field
                      label="Señales de alerta"
                      full
                      type="textarea"
                      value={formData.medical.alarmSignals}
                      onChange={(v) =>
                        updateNested(setFormData, "medical.alarmSignals", v)
                      }
                    />
                    <Field
                      label="Observaciones clínicas"
                      full
                      type="textarea"
                      value={formData.medical.notes}
                      onChange={(v) =>
                        updateNested(setFormData, "medical.notes", v)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Registro de alimentación"
                description="Registra la alimentación asociada al espécimen y al tanque seleccionado."
              >
                <div className="subsection-box">
                  <h4>Consumo alimentario</h4>
                  <p>
                    Completa solo lo que tenga sentido en el registro actual.
                  </p>

                  <div className="field-grid">
                    <Field
                      label="Fecha de alimentación"
                      type="date"
                      value={formData.feeding.date}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.date", v)
                      }
                    />
                    <Field
                      label="Tanque del registro"
                      value={formData.feeding.tank}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.tank", v)
                      }
                      options={aquarios.map((tank) => ({
                        value: tank.id,
                        label: `${tank.codigo_tanque} • ${tank.localizacao}`,
                      }))}
                    />
                    <Field
                      label="Croquetas Azoo (g)"
                      value={formData.feeding.croquetasAzoo}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.croquetasAzoo", v)
                      }
                    />
                    <Field
                      label="Croquetas Qualispiscis (g)"
                      value={formData.feeding.croquetasQualispiscis}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "feeding.croquetasQualispiscis",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Tilapia / salmón (g)"
                      value={formData.feeding.tilapiaSalmon}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.tilapiaSalmon", v)
                      }
                    />
                    <Field
                      label="Tubifex (g)"
                      value={formData.feeding.tubifex}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.tubifex", v)
                      }
                    />
                    <Field
                      label="Guppies (g)"
                      value={formData.feeding.guppies}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.guppies", v)
                      }
                    />
                    <Field
                      label="Lombriz (g)"
                      value={formData.feeding.earthworm}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.earthworm", v)
                      }
                    />
                    <Field
                      label="Tubifex liofilizado (g)"
                      value={formData.feeding.freezeDriedTubifex}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "feeding.freezeDriedTubifex",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Observaciones de alimentación"
                      full
                      type="textarea"
                      value={formData.feeding.observations}
                      onChange={(v) =>
                        updateNested(setFormData, "feeding.observations", v)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Registro comportamental"
                description="Registra observaciones de actividad, alimentación, interacción y señales comportamentales."
              >
                <div className="subsection-box">
                  <h4>Observación del comportamiento</h4>
                  <p>
                    Esta versión simplifica los intervalos en un único bloque de
                    observación.
                  </p>

                  <div className="field-grid">
                    <Field
                      label="Fecha de observación"
                      type="date"
                      value={formData.behavior.date}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.date", v)
                      }
                    />
                    <Field
                      label="Hora de inicio"
                      type="time"
                      value={formData.behavior.startTime}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.startTime", v)
                      }
                    />
                    <Field
                      label="Hora de finalización"
                      type="time"
                      value={formData.behavior.endTime}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.endTime", v)
                      }
                    />
                    <Field
                      label="Especie"
                      value={formData.behavior.species}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.species", v)
                      }
                    />
                    <Field
                      label="Espécimen"
                      value={formData.behavior.specimen}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.specimen", v)
                      }
                    />
                    <Field
                      label="Tanque"
                      value={formData.behavior.tank}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.tank", v)
                      }
                    />
                    <Field
                      label="Actividad general"
                      value={formData.behavior.generalActivity}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.generalActivity", v)
                      }
                    />
                    <Field
                      label="Comportamiento alimentario"
                      value={formData.behavior.feeding}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.feeding", v)
                      }
                    />
                    <Field
                      label="Cortejo"
                      value={formData.behavior.courtship}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.courtship", v)
                      }
                    />
                    <Field
                      label="Interacción social"
                      value={formData.behavior.socialInteraction}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "behavior.socialInteraction",
                          v,
                        )
                      }
                    />
                    <Field
                      label="URL de evidencia"
                      full
                      value={formData.behavior.evidenceUrl}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.evidenceUrl", v)
                      }
                    />
                    <Field
                      label="Movimientos branquiales"
                      value={formData.behavior.gillMovements}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.gillMovements", v)
                      }
                    />
                    <Field
                      label="Señales de alerta"
                      full
                      type="textarea"
                      value={formData.behavior.alarmSignals}
                      onChange={(v) =>
                        updateNested(setFormData, "behavior.alarmSignals", v)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Registro de óbito"
                description="Completa solo cuando el registro esté relacionado con la mortalidad del espécimen."
              >
                <div className="subsection-box">
                  <h4>Información de mortalidad</h4>
                  <p>Usa esta sección solo cuando corresponda.</p>

                  <div className="field-grid">
                    <Field
                      label="Fecha del óbito"
                      type="date"
                      value={formData.death.date}
                      onChange={(v) =>
                        updateNested(setFormData, "death.date", v)
                      }
                    />
                    <Field
                      label="Nombre vinculado al registro"
                      value={formData.death.name}
                      onChange={(v) =>
                        updateNested(setFormData, "death.name", v)
                      }
                    />
                    <Field
                      label="Causa"
                      full
                      value={formData.death.cause}
                      onChange={(v) =>
                        updateNested(setFormData, "death.cause", v)
                      }
                      type="textarea"
                    />
                    <Field
                      label="Necropsia"
                      full
                      value={formData.death.necropsy}
                      onChange={(v) =>
                        updateNested(setFormData, "death.necropsy", v)
                      }
                      type="textarea"
                    />
                    <Field
                      label="Observaciones finales"
                      full
                      value={formData.death.notes}
                      onChange={(v) =>
                        updateNested(setFormData, "death.notes", v)
                      }
                      type="textarea"
                    />
                  </div>
                </div>
              </SectionCard>

              <div className="record-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={handleReset}
                >
                  Limpiar
                </button>
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Registrando..." : "Guardar registro"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
