import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import Header from "../components/layout/Header";
import StatusModal from "../components/ui/StatusModal";
import RegistroValidationCard from "../components/ui/RegistroValidationCard";
import { useWallet } from "../../context/WalletContext.jsx";
import {
  VALIDATOR_ADDRESS,
  VALIDATOR_ABI,
  USER_ACCESS,
  USER_ACCESS_ABI,
} from "../config/contracts";
import "../styles/painelValidador.css";
import Footer from "../components/layout/Footer/index.jsx";

function matchRecord(record, search) {
  const normalized = search.toLowerCase();

  return (
    record.id.toLowerCase().includes(normalized) ||
    record.title.toLowerCase().includes(normalized) ||
    record.createdBy.toLowerCase().includes(normalized) ||
    record.linkedEntity.toLowerCase().includes(normalized) ||
    record.summary.toLowerCase().includes(normalized)
  );
}

export default function PainelValidador({ userRole = "auditor" }) {
  const navigate = useNavigate();
  const { walletAddress, user } = useWallet();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [loadingAction, setLoadingAction] = useState(null);
  const [records, setRecords] = useState([]);
  //Verificando roles necessarias: AUDITOR_ROLE no Validator + VALIDATOR_ROLE no Registry.
  const [hasValidatorPermission, setHasValidatorPermission] = useState(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    async function checkValidatorPermission() {
      if (!walletAddress || !window.ethereum || records.length === 0) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accessContract = new ethers.Contract(
          USER_ACCESS,
          USER_ACCESS_ABI,
          provider,
        );

        const institutionBlockchainIds = [
          ...new Set(
            records
              .map((r) => r.institutionBlockchainId)
              .filter((id) => id !== undefined && id !== null),
          ),
        ];

        if (institutionBlockchainIds.length === 0) {
          setHasValidatorPermission(false);
          return;
        }

        const checks = await Promise.all(
          institutionBlockchainIds.map((institutionId) =>
            accessContract.isInstitutionValidator(institutionId, walletAddress),
          ),
        );

        setHasValidatorPermission(checks.some(Boolean));
      } catch (err) {
        console.error("Erro ao verificar permissão de validador:", err);
        setHasValidatorPermission(false);
      }
    }

    checkValidatorPermission();
  }, [walletAddress, records]);

  //Buscando registros reais do backend.
  useEffect(() => {
    async function carregarRegistros() {
      try {
        const [resAxolote, resAquario] = await Promise.all([
          fetch("http://localhost:3000/registros/axolote"),
          fetch("http://localhost:3000/registros/aquario"),
        ]);

        const axoloteData = resAxolote.ok ? await resAxolote.json() : [];
        const aquarioData = resAquario.ok ? await resAquario.json() : [];

        console.log(
          "Axolote records:",
          axoloteData.length,
          "Aquario records:",
          aquarioData.length,
        );

        //Adaptando os registros do banco para o formato esperado pelo card.
        const registros = [
          ...axoloteData.map((r) => ({
            id: `axolote-${r.id}`,
            dbId: r.id,
            type: "axolote",
            institutionId: r.institution_id,
            institutionBlockchainId: r.institution_blockchain_id,
            onchainRecordId: r.onchain_record_id,
            status: (r.status_auditoria || "PENDENTE").toLowerCase(),
            title: `Registro de ajolote #${r.id}`,
            createdAt: r.data_registro
              ? new Date(r.data_registro).toLocaleString("pt-BR")
              : "—",
            createdBy: `Operador #${r.fk_operador_id}`,
            linkedEntity: `Ajolote #${r.fk_axolote_id}`,
            summary: `CID: ${r.cid_ipfs || "—"}`,
            data: {
              fields: {
                STATUS: r.status_auditoria || "PENDENTE",
                "DATA REGISTRO": r.data_registro
                  ? new Date(r.data_registro).toLocaleString("pt-BR")
                  : "—",
                "DATA MEDICAO": r.data_ultima_medicao
                  ? new Date(r.data_ultima_medicao).toLocaleDateString("pt-BR")
                  : "—",
                "ON-CHAIN ENTITY": r.onchain_entity_id
                  ? `#${r.onchain_entity_id}`
                  : "—",
                "ON-CHAIN RECORD": r.onchain_record_id
                  ? `#${r.onchain_record_id}`
                  : "Nao ancorado",
                "TX HASH": r.tx_hash ? `${r.tx_hash.slice(0, 10)}...` : "—",
                "CID IPFS": r.cid_ipfs || "—",
              },
              operador: r.fk_operador_id,
              axolote: r.fk_axolote_id,
            },
          })),
          ...aquarioData.map((r) => ({
            id: `aquario-${r.id}`,
            dbId: r.id,
            type: "ambiente",
            institutionId: r.institution_id,
            institutionBlockchainId: r.institution_blockchain_id,
            onchainRecordId: r.onchain_record_id,
            status: (r.status_auditoria || "PENDENTE").toLowerCase(),
            title: `Registro de acuario #${r.id}`,
            createdAt: r.data_registro
              ? new Date(r.data_registro).toLocaleString("pt-BR")
              : "—",
            createdBy: `Operador #${r.fk_operador_id}`,
            linkedEntity: `Acuario #${r.fk_aquario_id}`,
            summary: `CID: ${r.cid_ipfs || "—"}`,
            data: {
              fields: {
                STATUS: r.status_auditoria || "PENDENTE",
                "DATA REGISTRO": r.data_registro
                  ? new Date(r.data_registro).toLocaleString("pt-BR")
                  : "—",
                "DATA MEDICAO": r.data_ultima_medicao
                  ? new Date(r.data_ultima_medicao).toLocaleDateString("pt-BR")
                  : "—",
                "ON-CHAIN ENTITY": r.onchain_entity_id
                  ? `#${r.onchain_entity_id}`
                  : "—",
                "ON-CHAIN RECORD": r.onchain_record_id
                  ? `#${r.onchain_record_id}`
                  : "Nao ancorado",
                "TX HASH": r.tx_hash ? `${r.tx_hash.slice(0, 10)}...` : "—",
                "CID IPFS": r.cid_ipfs || "—",
              },
              operador: r.fk_operador_id,
              aquario: r.fk_aquario_id,
            },
          })),
        ];

        setRecords(registros);
        console.log(registros);
      } catch (err) {
        console.error("Erro ao carregar registros:", err);
      }
    }
    carregarRegistros();
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        search.trim() === "" ? true : matchRecord(record, search);

      const matchesFilter =
        filter === "todos"
          ? true
          : filter === "axolote"
            ? record.type === "axolote"
            : filter === "ambiente"
              ? record.type === "ambiente"
              : filter === "pendente"
                ? record.status === "pendente"
                : filter === "validado"
                  ? record.status === "aprovado"
                  : filter === "recusado"
                    ? record.status === "reprovado"
                    : true;

      return matchesSearch && matchesFilter;
    });
  }, [records, search, filter]);

  const counters = useMemo(() => {
    return {
      total: records.length,
      pendente: records.filter((r) => r.status === "pendente").length,
      aprovado: records.filter((r) => r.status === "aprovado").length,
      reprovado: records.filter((r) => r.status === "reprovado").length,
    };
  }, [records]);

  const handleApprove = async (record) => {
    setLoadingAction(`approve-${record.id}`);
    console.log("walletAddress:", walletAddress);
    console.log(record);

    if (!window.ethereum) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Cartera no disponible",
        message: "No se encontró ninguna cartera Web3 en el navegador.",
      });
      return;
    }

    if (!walletAddress) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Cartera no conectada",
        message: "Conecta tu cartera para validar registros.",
      });
      return;
    }

    if (!record) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Registro inválido",
        message: "No fue posible identificar el registro seleccionado.",
      });
      return;
    }

    if (record.status !== "pendente") {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Registro no disponible",
        message: "Solo los registros pendientes pueden ser aprobados.",
      });
      return;
    }

    if (!record.onchainRecordId) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Registro sin anclaje",
        message: "Este registro no fue anclado en la blockchain.",
      });
      return;
    }

    if (
      record.institutionBlockchainId === undefined ||
      record.institutionBlockchainId === null
    ) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Institución blockchain no identificada",
        message:
          "El registro no tiene institutionBlockchainId. Verifica la respuesta del backend.",
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const accessContract = new ethers.Contract(
        USER_ACCESS,
        USER_ACCESS_ABI,
        provider,
      );

      let canValidate = false;

      try {
        canValidate = await accessContract.isInstitutionValidator(
          record.institutionBlockchainId,
          walletAddress,
        );
      } catch (err) {
        console.error("Erro ao consultar permissão institucional:", err);
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Error de permiso",
          message:
            "No fue posible verificar tu permiso en la institución de este registro.",
        });
        return;
      } finally {
        setLoadingAction(null);
      }

      if (!canValidate) {
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Sin permiso",
          message:
            "Tu cartera no tiene permiso de validador para esta institución.",
        });
        return;
      }

      const parecerAuditoria = {
        registroId: record.dbId,
        tipo: record.type,
        decisao: "APROVADO",
        auditorWallet: walletAddress,
        institutionDbId: record.institutionDbId,
        institutionBlockchainId: record.institutionBlockchainId,
        timestamp: new Date().toISOString(),
      };

      let cidAuditoria = null;

      try {
        const ipfsRes = await fetch(
          "http://localhost:3000/registros/auditoria",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              registroId: record.dbId,
              tipo: record.type,
              dados: parecerAuditoria,
            }),
          },
        );

        if (!ipfsRes.ok) {
          throw new Error("Falha ao salvar parecer no backend/IPFS");
        }

        const data = await ipfsRes.json();
        cidAuditoria = data?.cid ?? null;
      } catch (err) {
        console.error("Erro ao salvar parecer de auditoria:", err);
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Error al registrar dictamen",
          message:
            "No fue posible guardar el dictamen de auditoría antes de la aprobación.",
        });
        return;
      }

      try {
        const validatorContract = new ethers.Contract(
          VALIDATOR_ADDRESS,
          VALIDATOR_ABI,
          signer,
        );

        const tx = await validatorContract.approveRecord(
          record.onchainRecordId,
        );
        await tx.wait();
      } catch (err) {
        console.error("Erro na aprovação on-chain:", err);

        const errStr =
          err?.reason ||
          err?.shortMessage ||
          err?.data?.message ||
          err?.message ||
          "";

        let msg = "No fue posible aprobar el registro en la blockchain.";

        if (errStr.includes("NOT_INSTITUTION_VALIDATOR")) {
          msg =
            "Tu cartera no es validadora de la institución de este registro.";
        } else if (errStr.includes("RECORD_NOT_PENDING")) {
          msg = "El registro ya no está pendiente.";
        } else if (errStr.includes("SELF_FINALIZATION_FORBIDDEN")) {
          msg = "Quien envió el registro no puede validarlo.";
        } else if (errStr.includes("RECORD_ALREADY_VALIDATED")) {
          msg = "Este registro ya fue validado anteriormente.";
        }

        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Error al aprobar",
          message: msg,
        });
        return;
      }

      try {
        const tipoRota = record.type === "axolote" ? "axolote" : "aquario";

        const syncRes = await fetch(
          `http://localhost:3000/registros/${tipoRota}/${record.dbId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "APROVADO",
              auditorId: walletAddress,
              cidAuditoria,
            }),
          },
        );

        if (!syncRes.ok) {
          throw new Error("Falha ao sincronizar status no banco");
        }
      } catch (err) {
        console.error("Erro ao sincronizar status no banco:", err);
        setStatusModal({
          isOpen: true,
          type: "warning",
          title: "Aprobado en la blockchain, pero con pendiente en el backend",
          message:
            "El registro fue aprobado on-chain, pero no fue posible actualizar la base de datos.",
        });
        return;
      }

      setRecords((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: "aprovado" } : item,
        ),
      );

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Registro aprobado",
        message: `El registro #${record.dbId} fue aprobado con éxito.`,
      });
    } catch (err) {
      console.error("Erro inesperado ao aprovar registro:", err);
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error inesperado",
        message: "Ocurrió un error inesperado al aprobar el registro.",
      });
    }
  };

  const handleReject = async (record) => {
    setLoadingAction(`reject-${record.id}`);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const accessContract = new ethers.Contract(
      USER_ACCESS,
      USER_ACCESS_ABI,
      provider,
    );

    const canValidate = await accessContract.isInstitutionValidator(
      record.institutionBlockchainId,
      walletAddress,
    );

    if (!canValidate) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Sin permiso",
        message:
          "Tu cartera no tiene permiso de validador para la institución de este registro.",
      });
      return;
    }

    try {
      //1. Subindo parecer de auditoria pro IPFS.
      const parecerAuditoria = {
        registroId: record.dbId,
        tipo: record.type,
        decisao: "REPROVADO",
        auditorWallet: walletAddress,
        timestamp: new Date().toISOString(),
      };

      const ipfsRes = await fetch("http://localhost:3000/registros/auditoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registroId: record.dbId,
          tipo: record.type,
          dados: parecerAuditoria,
        }),
      });
      const { cid: cidAuditoria } = await ipfsRes.json();

      //2. Chamando rejectRecord com o ID ON-CHAIN (nao o ID do banco).
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        VALIDATOR_ADDRESS,
        VALIDATOR_ABI,
        signer,
      );

      const tx = await contract.rejectRecord(record.onchainRecordId);
      await tx.wait();

      //3. Sincronizando status no banco de dados (com CID de auditoria).
      const tipoRota = record.type === "axolote" ? "axolote" : "aquario";

      await fetch(
        `http://localhost:3000/registros/${tipoRota}/${record.dbId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "REPROVADO",
            auditorId: walletAddress,
            cidAuditoria,
          }),
        },
      );

      setRecords((prev) =>
        prev.map((item) =>
          item.id === record.id ? { ...item, status: "reprovado" } : item,
        ),
      );

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Registro rechazado",
        message: `El registro #${record.dbId} fue rechazado en la blockchain y guardado en la base de datos.`,
      });
    } catch (error) {
      console.error("Erro ao rejeitar registro:", error);
      let msg = "No fue posible rechazar el registro. Verifica tu cartera.";
      const errStr = error?.data || error?.message || "";
      if (errStr.includes("0xe2517d3f")) {
        msg =
          "Error de permiso (AccessControl). Haz clic en 'Configurar roles' en la barra lateral para conceder los roles necesarios.";
      } else if (errStr.includes("ALREADY_VALIDATED")) {
        msg =
          "Este registro ya fue validado anteriormente. No es posible rechazarlo.";
      }
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Error al rechazar",
        message: msg,
      });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <main className="validator-page">
      <Header />

      <div className="validator-content">
        <div className="validator-wrapper">
          <aside className="validator-sidebar">
            <div className="validator-sidebar-inner">
              <button
                type="button"
                className="validator-back-button"
                onClick={() => navigate(-1)}
              >
                Volver
              </button>

              <span className="validator-badge">Panel de validación</span>

              <div className="validator-sidebar-copy">
                <h1>Revisión de registros</h1>
                <p>
                  Analiza los registros generados en el sistema, filtra por tipo
                  o estado y, si tienes permiso de auditor, valida o rechaza
                  cada elemento.
                </p>
              </div>

              <div className="validator-sidebar-card">
                <strong>Perfil actual</strong>
                <span>
                  {userRole === "auditor"
                    ? "Auditor — puede validar o rechazar."
                    : "Operador — solo visualización."}
                </span>
              </div>

              <div className="validator-sidebar-card">
                <strong>Resumen</strong>
                <span>Total: {counters.total}</span>
                <span>Pendientes: {counters.pendente}</span>
                <span>Aprobados: {counters.aprovado}</span>
                <span>Rechazados: {counters.reprovado}</span>
              </div>

              <div className="validator-sidebar-card">
                <strong>Permiso blockchain</strong>
                {hasValidatorPermission === null ? (
                  <span>Verificando...</span>
                ) : hasValidatorPermission ? (
                  <span>
                    ✅ Activado — puede validar y rechazar registros de su
                    institución.
                  </span>
                ) : (
                  <span>
                    ❌ Su cartera no tiene permiso de validador para los
                    registros cargados.
                  </span>
                )}
              </div>
            </div>
          </aside>

          <section className="validator-main">
            <div className="validator-main-inner">
              <div className="validator-top-card">
                <h2>Registros disponibles</h2>
                <p>
                  Busca por ID, entidad vinculada, título o responsable y usa
                  los filtros para encontrar más rápido.
                </p>

                <div className="validator-toolbar">
                  <input
                    type="text"
                    className="validator-search"
                    placeholder="Buscar por ID, título, vínculo o responsable"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    className="validator-filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="axolote">Solo ajolote</option>
                    <option value="ambiente">Solo ambiente</option>
                    <option value="pendente">Solo pendientes</option>
                    <option value="validado">Solo validados</option>
                    <option value="recusado">Solo rechazados</option>
                  </select>
                </div>
              </div>

              <div className="validation-list">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <RegistroValidationCard
                      key={record.id}
                      record={record}
                      userRole={userRole}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      isApproving={loadingAction === `approve-${record.id}`}
                      isRejecting={loadingAction === `reject-${record.id}`}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No se encontró ningún registro con los filtros aplicados.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        confirmLabel="Cerrar"
        onClose={() =>
          setStatusModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
        onConfirm={() =>
          setStatusModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />
      <Footer></Footer>
    </main>
  );
}
