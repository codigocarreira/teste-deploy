import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Header from "../components/layout/Header";
import SectionCard from "../components/layout/Forms/SectionCard";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../config/contracts";
import "../styles/registroNovo.css";
import { useAquarios } from "../../hooks/useAquarios";
import { useWallet } from "../../context/WalletContext.jsx";
import StatusModal from "../components/ui/StatusModal";
import axoloveRegistro from "../assets/axolove-registro.png";

const initialState = {
  tank: "",
  date: "",
  time: "",
  author: "",

  physicalConditions: {
    temperature: "",
    turbidity: "",
    transparency: "",
    conductivity: "",
    tds: "",
    tss: "",
    flowRate: "",
    currentSpeed: "",
    waterColumn: "",
  },

  basicChemistry: {
    phReagent: "",
    phPotentiometer: "",
    alkalinity: "",
    generalHardnessGH: "",
    carbonateHardnessKH: "",
    salinity: "",
  },

  nutrients: {
    totalAmmonium: "",
    unionizedAmmonia: "",
    nitrites: "",
    nitrates: "",
    phosphates: "",
  },

  organicAndMicrobial: {
    totalOrganicCarbon: "",
    bod5: "",
    cod: "",
    totalColiforms: "",
    heterotrophicBacteria: "",
    chlorophyllA: "",
    algalBiomass: "",
    algalCoverage: "",
  },

  toxicContaminants: {
    residualChlorine: "",
    chloramines: "",
    copper: "",
    lead: "",
    zinc: "",
    cadmium: "",
    mercury: "",
    totalHydrocarbons: "",
    pesticides: "",
    surfactants: "",
  },

  dissolvedGases: {
    dissolvedOxygen: "",
    dissolvedOxygenSaturation: "",
    dissolvedCO2: "",
    hydrogenSulfide: "",
    orp: "",
  },

  alarmSignals: "",
  notes: "",

  roomConditionRecords: {
    date: "",
    time: "",
    author: "",
    climate: {
      airTemperature: "",
      relativeHumidity: "",
      atmosphericPressure: "",
      airSpeed: "",
      airExchangeRate: "",
    },
    illumination: {
      lightIntensity: "",
      photoperiod: "",
      lightSpectrum: "",
    },
    airQuality: {
      ambientCO2: "",
      atmosphericPollutants: "",
      noiseLevel: "",
    },
  },

  spatialContext: {
    geography: {
      latitude: "",
      longitude: "",
      altitude: "",
      klimaZone: "",
    },
    operationalContext: {
      facilityId: "",
      facilityType: "",
      distanceToPollutionSources: "",
    },
  },

  naturalEcosystem: {
    habitat: {
      aquaticSystemType: "",
      waterPermanence: "",
      maxDepth: "",
      avgDepth: "",
      surfaceArea: "",
    },
    aquaticVegetation: {
      dominantSpecies: "",
      totalCoverage: "",
      stratification: "",
      plantDensity: "",
    },
    associatedFauna: {
      predators: "",
      competitors: "",
      prey: "",
      invasiveSpecies: "",
    },
    naturalSubstrate: {
      substrateType: "",
      granulometry: "",
      organicMatter: "",
    },
    hydrology: {
      waterSource: "",
      hydrologicalConnectivity: "",
      flowVariability: "",
    },
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
    date: "Selecione a data",
    time: "Selecione o horário",
    textarea: "Digite aqui...",
    number: "Digite um valor",
    email: "Digite o e-mail",
    url: "Cole o link aqui",
  };

  const placeholder = placeholderMap[type] || `Digite ${label.toLowerCase()}`;

  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>{label}</label>
      {hint && <small>{hint}</small>}

      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{`Selecione ${label.toLowerCase()}`}</option>
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

export default function RegistroAquario() {
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

  //Buscando aquarios do banco de dados.
  const { aquarios } = useAquarios();

  const selectedTank = useMemo(
    () => aquarios.find((a) => String(a.id) === String(formData.tank)) || null,
    [formData.tank, aquarios],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        schemaVersion: "1.0.0",
        datasetType: "environment",
        timestamp: new Date().toISOString(),
        author: formData.author || "Usuário do sistema",
        waterQualityRecords: [
          {
            date: formData.date,
            time: formData.time || null,
            author: formData.author || null,
            tank: formData.tank,
            physicalConditions: formData.physicalConditions,
            basicChemistry: formData.basicChemistry,
            nutrients: formData.nutrients,
            organicAndMicrobial: formData.organicAndMicrobial,
            toxicContaminants: formData.toxicContaminants,
            dissolvedGases: formData.dissolvedGases,
            alarmSignals: formData.alarmSignals || null,
            notes: formData.notes || null,
          },
        ],
        roomConditionRecords: [
          {
            ...formData.roomConditionRecords,
          },
        ],
        spatialContext: formData.spatialContext,
        naturalEcosystem: formData.naturalEcosystem,
      };

      const response = await fetch("https://axolove-deploy-1004.onrender.com/registros/aquario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aquarioId: formData.tank,
          operadorId: walletAddress || formData.author,
          dados: payload,
          dataMedicao: formData.date,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar registro");

      const result = await response.json();
      console.log("Registro criado:", result);

      //Buscando o onchainEntityId do aquario ja cadastrado.
      const aquarioRes = await fetch(
        `https://axolove-deploy-1004.onrender.com/aquarios/${formData.tank}`,
      );
      if (!aquarioRes.ok) throw new Error("Aquario não encontrado no banco");
      const aquarioData = await aquarioRes.json();

      if (!aquarioData.onchain_entity_id) {
        throw new Error(
          "Este aquário não foi registrado na blockchain. Cadastre-o primeiro pelo formulário de inserção.",
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
        Number(aquarioData.onchain_entity_id),
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
          "Não foi possível identificar o ID on-chain do registro.",
        );
      }

      const onchainRecordId = Number(event.args.recordId);

      //Salvando IDs on-chain e tx_hash no banco de dados.
      await fetch(
        `https://axolove-deploy-1004.onrender.com/registros/aquario/${result.registro.id}/onchain`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            onchainEntityId: Number(aquarioData.onchain_entity_id),
            onchainRecordId,
            txHash: receipt.hash,
          }),
        },
      );

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Registro criado com sucesso",
        message: `O registro ambiental foi salvo no IPFS (CID: ${result.cid}) e ancorado na blockchain (tx: ${receipt.hash}).`,
      });
    } catch (error) {
      console.error("Erro ao criar registro ambiental:", error);

      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Não foi possível salvar",
        message:
          "Ocorreu um erro ao criar o registro ambiental. Revise os dados e tente novamente.",
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
                Voltar
              </button>

              <span className="record-badge">Registro ambiental</span>

              <div>
                <h1>Novo registro de ambiente</h1>
                <p>
                  Selecione um aquário já cadastrado e registre novas medições
                  de água, condições do ambiente e contexto do espaço.
                </p>
              </div>

              <div className="record-image-box">
                <img src={axoloveRegistro} alt="Registro de axolote" />
              </div>

              <div className="record-sidebar-card">
                <strong>Como esta tela funciona</strong>
                <span>
                  Esta página cria apenas um novo registro. O aquário já deve
                  ter sido cadastrado anteriormente em outra tela do sistema.
                </span>
              </div>
            </div>
          </aside>

          <form className="record-main" onSubmit={handleSubmit}>
            <div className="record-main-inner">
              <div className="record-top-card">
                <h2>Seleção do aquário e contexto</h2>
                <p>
                  Escolha um aquário existente para vincular o novo registro
                  ambiental.
                </p>

                <div className="field-grid" style={{ marginTop: 16 }}>
                  <Field
                    label="Aquário cadastrado"
                    value={formData.tank}
                    onChange={(value) =>
                      updateNested(setFormData, "tank", value)
                    }
                    options={aquarios.map((tank) => ({
                      value: tank.id,
                      label: `${tank.localizacao} • ${tank.codigo_tanque}`,
                    }))}
                  />

                  <Field
                    label="Responsável pelo registro"
                    value={formData.author}
                    onChange={(value) =>
                      updateNested(setFormData, "author", value)
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
                  statusModal.type === "success" ? "Ir para o painel" : "Fechar"
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
                title="Dados gerais da coleta"
                description="Preencha os dados básicos que identificam quando este registro foi realizado."
                defaultOpen
              >
                <div className="subsection-box">
                  <h4>Identificação da medição</h4>
                  <p>Informações iniciais do registro ambiental.</p>

                  <div className="field-grid">
                    <Field
                      label="Data da coleta"
                      type="date"
                      value={formData.date}
                      onChange={(value) =>
                        updateNested(setFormData, "date", value)
                      }
                    />

                    <Field
                      label="Hora da coleta"
                      type="time"
                      value={formData.time}
                      onChange={(value) =>
                        updateNested(setFormData, "time", value)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Condições físicas da água"
                description="Registre variáveis ligadas à temperatura, transparência, sólidos e dinâmica da água."
              >
                <div className="subsection-box">
                  <h4>Medições físicas</h4>
                  <p>Campos principais de acompanhamento físico do tanque.</p>

                  <div className="field-grid">
                    <Field
                      label="Temperatura (°C)"
                      value={formData.physicalConditions.temperature}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.temperature",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Turbidez (NTU)"
                      value={formData.physicalConditions.turbidity}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.turbidity",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Transparência"
                      value={formData.physicalConditions.transparency}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.transparency",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Condutividade (µS/cm)"
                      value={formData.physicalConditions.conductivity}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.conductivity",
                          v,
                        )
                      }
                    />
                    <Field
                      label="TDS"
                      value={formData.physicalConditions.tds}
                      onChange={(v) =>
                        updateNested(setFormData, "physicalConditions.tds", v)
                      }
                    />
                    <Field
                      label="TSS"
                      value={formData.physicalConditions.tss}
                      onChange={(v) =>
                        updateNested(setFormData, "physicalConditions.tss", v)
                      }
                    />
                    <Field
                      label="Vazão"
                      value={formData.physicalConditions.flowRate}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.flowRate",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Velocidade da corrente"
                      value={formData.physicalConditions.currentSpeed}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.currentSpeed",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Coluna d’água"
                      value={formData.physicalConditions.waterColumn}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "physicalConditions.waterColumn",
                          v,
                        )
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Química básica"
                description="Registre variáveis ligadas ao equilíbrio químico da água e à estabilidade do sistema."
              >
                <div className="subsection-box">
                  <h4>Equilíbrio químico</h4>
                  <p>
                    Indicadores usados no controle básico da qualidade da água.
                  </p>

                  <div className="field-grid">
                    <Field
                      label="pH (reagente)"
                      value={formData.basicChemistry.phReagent}
                      onChange={(v) =>
                        updateNested(setFormData, "basicChemistry.phReagent", v)
                      }
                    />
                    <Field
                      label="pH (potenciômetro)"
                      value={formData.basicChemistry.phPotentiometer}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "basicChemistry.phPotentiometer",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Alcalinidade (ppm CaCO₃)"
                      value={formData.basicChemistry.alkalinity}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "basicChemistry.alkalinity",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Dureza geral GH (ppm CaCO₃)"
                      value={formData.basicChemistry.generalHardnessGH}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "basicChemistry.generalHardnessGH",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Dureza carbonatada KH (ppm CaCO₃)"
                      value={formData.basicChemistry.carbonateHardnessKH}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "basicChemistry.carbonateHardnessKH",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Salinidade"
                      value={formData.basicChemistry.salinity}
                      onChange={(v) =>
                        updateNested(setFormData, "basicChemistry.salinity", v)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Nutrientes"
                description="Registre compostos nitrogenados e fosfatos que impactam o equilíbrio do tanque."
              >
                <div className="subsection-box">
                  <h4>Compostos dissolvidos</h4>
                  <p>
                    Acompanhe indicadores associados à ciclagem e ao excesso de
                    nutrientes.
                  </p>

                  <div className="field-grid">
                    <Field
                      label="Amônio total (mg/L)"
                      value={formData.nutrients.totalAmmonium}
                      onChange={(v) =>
                        updateNested(setFormData, "nutrients.totalAmmonium", v)
                      }
                    />
                    <Field
                      label="Amônia não ionizada (mg/L)"
                      value={formData.nutrients.unionizedAmmonia}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "nutrients.unionizedAmmonia",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Nitritos (mg/L)"
                      value={formData.nutrients.nitrites}
                      onChange={(v) =>
                        updateNested(setFormData, "nutrients.nitrites", v)
                      }
                    />
                    <Field
                      label="Nitratos (mg/L)"
                      value={formData.nutrients.nitrates}
                      onChange={(v) =>
                        updateNested(setFormData, "nutrients.nitrates", v)
                      }
                    />
                    <Field
                      label="Fosfatos (mg/L)"
                      value={formData.nutrients.phosphates}
                      onChange={(v) =>
                        updateNested(setFormData, "nutrients.phosphates", v)
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Matéria orgânica e microbiologia"
                description="Registre indicadores laboratoriais relacionados à carga orgânica e ao crescimento microbiológico."
              >
                <div className="subsection-box">
                  <h4>Indicadores laboratoriais</h4>
                  <p>Use esta seção quando houver análise complementar.</p>

                  <div className="field-grid">
                    <Field
                      label="Carbono orgânico total"
                      value={formData.organicAndMicrobial.totalOrganicCarbon}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.totalOrganicCarbon",
                          v,
                        )
                      }
                    />
                    <Field
                      label="DBO 5"
                      value={formData.organicAndMicrobial.bod5}
                      onChange={(v) =>
                        updateNested(setFormData, "organicAndMicrobial.bod5", v)
                      }
                    />
                    <Field
                      label="DQO"
                      value={formData.organicAndMicrobial.cod}
                      onChange={(v) =>
                        updateNested(setFormData, "organicAndMicrobial.cod", v)
                      }
                    />
                    <Field
                      label="Coliformes totais"
                      value={formData.organicAndMicrobial.totalColiforms}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.totalColiforms",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Bactérias heterotróficas"
                      value={formData.organicAndMicrobial.heterotrophicBacteria}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.heterotrophicBacteria",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Clorofila A"
                      value={formData.organicAndMicrobial.chlorophyllA}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.chlorophyllA",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Biomassa algal"
                      value={formData.organicAndMicrobial.algalBiomass}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.algalBiomass",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Cobertura algal"
                      value={formData.organicAndMicrobial.algalCoverage}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "organicAndMicrobial.algalCoverage",
                          v,
                        )
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Contaminantes"
                description="Registre compostos potencialmente tóxicos presentes na água."
              >
                <div className="subsection-box">
                  <h4>Risco químico</h4>
                  <p>
                    Campos úteis em análises de contaminação ou monitoramento
                    preventivo.
                  </p>

                  <div className="field-grid">
                    <Field
                      label="Cloro residual (mg/L)"
                      value={formData.toxicContaminants.residualChlorine}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.residualChlorine",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Cloraminas (mg/L)"
                      value={formData.toxicContaminants.chloramines}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.chloramines",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Cobre (µg/L)"
                      value={formData.toxicContaminants.copper}
                      onChange={(v) =>
                        updateNested(setFormData, "toxicContaminants.copper", v)
                      }
                    />
                    <Field
                      label="Chumbo (µg/L)"
                      value={formData.toxicContaminants.lead}
                      onChange={(v) =>
                        updateNested(setFormData, "toxicContaminants.lead", v)
                      }
                    />
                    <Field
                      label="Zinco (µg/L)"
                      value={formData.toxicContaminants.zinc}
                      onChange={(v) =>
                        updateNested(setFormData, "toxicContaminants.zinc", v)
                      }
                    />
                    <Field
                      label="Cádmio (µg/L)"
                      value={formData.toxicContaminants.cadmium}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.cadmium",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Mercúrio (µg/L)"
                      value={formData.toxicContaminants.mercury}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.mercury",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Hidrocarbonetos totais"
                      value={formData.toxicContaminants.totalHydrocarbons}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.totalHydrocarbons",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Pesticidas"
                      value={formData.toxicContaminants.pesticides}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.pesticides",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Surfactantes"
                      value={formData.toxicContaminants.surfactants}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "toxicContaminants.surfactants",
                          v,
                        )
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Gases dissolvidos e observações"
                description="Registre gases dissolvidos, sinais de alerta e observações gerais da medição."
              >
                <div className="subsection-box">
                  <h4>Gases e observações finais</h4>
                  <p>Consolide sinais relevantes da coleta ambiental.</p>

                  <div className="field-grid">
                    <Field
                      label="Oxigênio dissolvido (mg/L)"
                      value={formData.dissolvedGases.dissolvedOxygen}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "dissolvedGases.dissolvedOxygen",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Saturação de oxigênio (%)"
                      value={formData.dissolvedGases.dissolvedOxygenSaturation}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "dissolvedGases.dissolvedOxygenSaturation",
                          v,
                        )
                      }
                    />
                    <Field
                      label="CO₂ dissolvido (mg/L)"
                      value={formData.dissolvedGases.dissolvedCO2}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "dissolvedGases.dissolvedCO2",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Sulfeto de hidrogênio (mg/L)"
                      value={formData.dissolvedGases.hydrogenSulfide}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "dissolvedGases.hydrogenSulfide",
                          v,
                        )
                      }
                    />
                    <Field
                      label="ORP (mV)"
                      value={formData.dissolvedGases.orp}
                      onChange={(v) =>
                        updateNested(setFormData, "dissolvedGases.orp", v)
                      }
                    />
                    <Field
                      label="Sinais de alerta"
                      full
                      value={formData.alarmSignals}
                      onChange={(v) =>
                        updateNested(setFormData, "alarmSignals", v)
                      }
                      type="textarea"
                    />
                    <Field
                      label="Observações gerais"
                      full
                      value={formData.notes}
                      onChange={(v) => updateNested(setFormData, "notes", v)}
                      type="textarea"
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Condições do ambiente"
                description="Registre variáveis do espaço físico, como clima, iluminação e qualidade do ar."
              >
                <div className="subsection-box">
                  <h4>Dados gerais do ambiente</h4>
                  <p>Use esta seção para variáveis externas ao tanque.</p>

                  <div className="field-grid">
                    <Field
                      label="Data do ambiente"
                      type="date"
                      value={formData.roomConditionRecords.date}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.date",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Hora do ambiente"
                      type="time"
                      value={formData.roomConditionRecords.time}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.time",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Autor do ambiente"
                      value={formData.roomConditionRecords.author}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.author",
                          v,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="subsection-box">
                  <h4>Clima</h4>
                  <p>Variáveis atmosféricas e de circulação do ar.</p>

                  <div className="field-grid">
                    <Field
                      label="Temperatura do ar (°C)"
                      value={
                        formData.roomConditionRecords.climate.airTemperature
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.climate.airTemperature",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Umidade relativa (%)"
                      value={
                        formData.roomConditionRecords.climate.relativeHumidity
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.climate.relativeHumidity",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Pressão atmosférica"
                      value={
                        formData.roomConditionRecords.climate
                          .atmosphericPressure
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.climate.atmosphericPressure",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Velocidade do ar"
                      value={formData.roomConditionRecords.climate.airSpeed}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.climate.airSpeed",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Taxa de renovação do ar"
                      value={
                        formData.roomConditionRecords.climate.airExchangeRate
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.climate.airExchangeRate",
                          v,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="subsection-box">
                  <h4>Iluminação</h4>
                  <p>Condições de luz do ambiente de manutenção.</p>

                  <div className="field-grid">
                    <Field
                      label="Intensidade luminosa"
                      value={
                        formData.roomConditionRecords.illumination
                          .lightIntensity
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.illumination.lightIntensity",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Fotoperíodo"
                      value={
                        formData.roomConditionRecords.illumination.photoperiod
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.illumination.photoperiod",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Espectro de luz"
                      value={
                        formData.roomConditionRecords.illumination.lightSpectrum
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.illumination.lightSpectrum",
                          v,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="subsection-box">
                  <h4>Qualidade do ar</h4>
                  <p>Indicadores ambientais complementares.</p>

                  <div className="field-grid">
                    <Field
                      label="CO₂ ambiente"
                      value={
                        formData.roomConditionRecords.airQuality.ambientCO2
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.airQuality.ambientCO2",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Poluentes atmosféricos"
                      value={
                        formData.roomConditionRecords.airQuality
                          .atmosphericPollutants
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.airQuality.atmosphericPollutants",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Nível de ruído"
                      value={
                        formData.roomConditionRecords.airQuality.noiseLevel
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "roomConditionRecords.airQuality.noiseLevel",
                          v,
                        )
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Contexto espacial"
                description="Registre dados fixos do local e do contexto operacional quando necessário."
              >
                <div className="subsection-box">
                  <h4>Geografia</h4>
                  <p>Informações espaciais do local de manutenção.</p>

                  <div className="field-grid">
                    <Field
                      label="Latitude"
                      value={formData.spatialContext.geography.latitude}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.geography.latitude",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Longitude"
                      value={formData.spatialContext.geography.longitude}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.geography.longitude",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Altitude"
                      value={formData.spatialContext.geography.altitude}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.geography.altitude",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Zona climática"
                      value={formData.spatialContext.geography.klimaZone}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.geography.klimaZone",
                          v,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="subsection-box">
                  <h4>Contexto operacional</h4>
                  <p>Dados da instalação e do seu entorno.</p>

                  <div className="field-grid">
                    <Field
                      label="ID da instalação"
                      value={
                        formData.spatialContext.operationalContext.facilityId
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.operationalContext.facilityId",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Tipo de instalação"
                      value={
                        formData.spatialContext.operationalContext.facilityType
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.operationalContext.facilityType",
                          v,
                        )
                      }
                      options={[
                        { value: "laboratory", label: "Laboratório" },
                        { value: "museum", label: "Museu" },
                        { value: "home", label: "Residência" },
                        { value: "rescue_center", label: "Centro de resgate" },
                        { value: "field_station", label: "Estação de campo" },
                      ]}
                    />
                    <Field
                      label="Distância de fontes poluentes"
                      value={
                        formData.spatialContext.operationalContext
                          .distanceToPollutionSources
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "spatialContext.operationalContext.distanceToPollutionSources",
                          v,
                        )
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Ecossistema natural"
                description="Preencha apenas se este registro exigir contexto de habitat natural."
              >
                <div className="subsection-box">
                  <h4>Habitat</h4>
                  <p>Características gerais do ambiente natural associado.</p>

                  <div className="field-grid">
                    <Field
                      label="Tipo de sistema aquático"
                      value={
                        formData.naturalEcosystem.habitat.aquaticSystemType
                      }
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "naturalEcosystem.habitat.aquaticSystemType",
                          v,
                        )
                      }
                      options={[
                        { value: "lake", label: "Lago" },
                        { value: "lagoon", label: "Laguna" },
                        { value: "river", label: "Rio" },
                        { value: "stream", label: "Córrego" },
                        { value: "canal", label: "Canal" },
                        { value: "chinampa", label: "Chinampa" },
                        { value: "dam", label: "Represa" },
                        { value: "spring", label: "Nascente" },
                      ]}
                    />
                    <Field
                      label="Permanência da água"
                      value={formData.naturalEcosystem.habitat.waterPermanence}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "naturalEcosystem.habitat.waterPermanence",
                          v,
                        )
                      }
                      options={[
                        { value: "permanent", label: "Permanente" },
                        { value: "temporary", label: "Temporária" },
                        { value: "seasonal", label: "Sazonal" },
                      ]}
                    />
                    <Field
                      label="Profundidade máxima"
                      value={formData.naturalEcosystem.habitat.maxDepth}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "naturalEcosystem.habitat.maxDepth",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Profundidade média"
                      value={formData.naturalEcosystem.habitat.avgDepth}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "naturalEcosystem.habitat.avgDepth",
                          v,
                        )
                      }
                    />
                    <Field
                      label="Área de superfície"
                      value={formData.naturalEcosystem.habitat.surfaceArea}
                      onChange={(v) =>
                        updateNested(
                          setFormData,
                          "naturalEcosystem.habitat.surfaceArea",
                          v,
                        )
                      }
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
                  Limpar
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
