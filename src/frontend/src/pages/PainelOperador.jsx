import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/painelOperador.css";
import axolote from "../assets/imagemPainelOperador.png";
import axoloveOperador from "../assets/axolove-operador.png";
import PageLayout from "../components/layout/PageLayout";
import RegistroViewerCard from "../components/ui/RegistroViewCard";

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

function PainelOperador() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("todos");
  const [allRecords, setAllRecords] = useState([]);

  useEffect(() => {
    async function carregarRegistros() {
      try {
        const [resAxolote, resAquario] = await Promise.all([
          fetch("http://localhost:3000/registros/axolote"),
          fetch("http://localhost:3000/registros/aquario"),
        ]);

        const axoloteData = resAxolote.ok ? await resAxolote.json() : [];
        const aquarioData = resAquario.ok ? await resAquario.json() : [];

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

        setAllRecords(registros);
      } catch (err) {
        console.error("Error al cargar registros:", err);
      }
    }
    carregarRegistros();
  }, []);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((record) => {
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
  }, [search, filter, allRecords]);

  return (
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerSideImage={axoloveOperador}
      bannerTitle="Panel de Operador"
      bannerSubtitle="Accede a los principales flujos de registro y gestiona los registros de acuarios y ajolotes de forma organizada."
      bannerVariant="green"
    >
      <section className="painel">
        <div className="painelContent">
          <div className="painelText">
            <span className="painelBadge">Operaciones</span>
            <h2 className="painelTitle">Elige un flujo de registro</h2>
            <p className="painelSubtitle">
              Selecciona una de las opciones para registrar acuarios, ajolotes o
              crear un nuevo registro vinculado a una entidad existente.
            </p>
          </div>

          <div className="painelBody">
            <div className="painelImage">
              <img src={axolote} alt="ajolote" />
            </div>

            <div className="cards">
              <div
                className="card"
                onClick={() => navigate("/adicionarPecera")}
              >
                <h3>Registrar acuario</h3>
                <p>Registrar un nuevo acuario</p>
              </div>

              <div
                className="card"
                onClick={() => navigate("/adicionarAjolote")}
              >
                <h3>Registrar ajolote</h3>
                <p>Registrar un nuevo ajolote</p>
              </div>

              <div
                className="card"
                onClick={() => navigate("/registro-aquario")}
              >
                <h3>Crear registro de acuario</h3>
                <p>Agregar un registro al acuario</p>
              </div>

              <div
                className="card"
                onClick={() => navigate("/registro-axolote")}
              >
                <h3>Crear registro de ajolote</h3>
                <p>Agregar un registro al ajolote</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="painelRecordsSection">
        <div className="painelRecordsHeader">
          <h2 className="painelRecordsTitle">Explorar registros creados</h2>
          <p className="painelRecordsSubtitle">
            Busca y filtra registros de ajolotes y entornos. Haz clic en una
            tarjeta para ver los detalles.
          </p>
        </div>

        <div className="painelRecordsToolbar">
          <input
            type="text"
            className="painelRecordsSearch"
            placeholder="Buscar por ID, título, entidad o creador"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="painelRecordsFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="axolote">Solo ajolote</option>
            <option value="ambiente">Solo entorno</option>
            <option value="pendente">Pendiente</option>
            <option value="validado">Validado</option>
            <option value="recusado">Rechazado</option>
          </select>
        </div>

        <div className="painelRecordsList">
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RegistroViewerCard key={record.id} record={record} />
            ))
          ) : (
            <div className="empty-state">
              No se encontraron registros con los filtros actuales.
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}

export default PainelOperador;
