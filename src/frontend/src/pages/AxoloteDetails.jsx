import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineCalendar,
} from "react-icons/ai";
import { PiDropFill } from "react-icons/pi";
import { FaWeightHanging } from "react-icons/fa";
import { MdStraighten } from "react-icons/md";
import { HiOutlineBeaker } from "react-icons/hi2";
import { FiMapPin } from "react-icons/fi";
import { TbHeartbeat } from "react-icons/tb";
import "../styles/axoloteDetails.css";
import GraficoAxolote from "../components/ui/GraficoAxolote";

export default function AxoloteDetails() {
  const navigate = useNavigate();
  const { specimenId } = useParams();
  const [specimen, setSpecimen] = useState(null);
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [resumo, setResumo] = useState({});

  //Buscando axolote e aquario do backend.
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`http://localhost:3000/axolotes/${specimenId}`);
        if (!res.ok) throw new Error("Axolote nao encontrado");
        const data = await res.json();
        setSpecimen(data);

        if (data.fk_aquario_id) {
          const resAq = await fetch("http://localhost:3000/aquarios");
          if (resAq.ok) {
            const aquarios = await resAq.json();
            const aq = aquarios.find((a) => a.id === data.fk_aquario_id);
            setTank(aq || null);
          }
        }

        const responseHistory = await fetch(
          `http://localhost:3000/registros/axolote/${specimenId}/pesoVsTamanho`,
        );
        if (responseHistory.ok) {
          const hist = await responseHistory.json();
          const histFormatado = hist.map((item) => ({
            ...item,
            data: new Date(item.data).toLocaleDateString("pt-BR"),
          }));

          setHistory(histFormatado);
          console.log("Historico bruto:", hist);
        }

        const resResumo = await fetch(
          `http://localhost:3000/registros/axolote/${specimenId}/resumo`,
        );

        if (resResumo.ok) {
          const dataResumo = await resResumo.json();

          setHistory(
            dataResumo.historico.map((item) => ({
              ...item,
              data: new Date(item.data).toLocaleDateString("pt-BR"),
            })),
          );

          setResumo(dataResumo.resumo);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [specimenId]);

  if (loading) {
    return (
      <main className="record-page">
        <div className="record-content">
          <div className="record-main" style={{ padding: "32px" }}>
            <p style={{ color: "#5f6b85" }}>Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!specimen) {
    return (
      <main className="record-page">
        <div className="record-content">
          <div className="record-main" style={{ padding: "32px" }}>
            <h2 style={{ color: "#142562", marginBottom: "8px" }}>
              Axolote não encontrado
            </h2>
            <p style={{ color: "#5f6b85", marginBottom: "20px" }}>
              Não foi possível localizar o registro solicitado.
            </p>
            <button
              className="record-back-button record-back-button--dark"
              onClick={() => navigate(-1)}
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="record-page">
      <div className="record-content">
        <div className="record-wrapper">
          <aside className="record-sidebar">
            <div className="record-sidebar-inner">
              <button
                className="record-back-button"
                onClick={() => navigate(-1)}
              >
                <AiOutlineArrowLeft />
                <span>Voltar</span>
              </button>

              <span className="record-badge">Registro de especímenes</span>

              <div>
                <h1>{specimen.especie_apelido}</h1>
                <p>
                  Visualización detallada del ajolote con datos biológicos,
                  trazabilidad de los registros e información actualizada del
                  acuario.
                </p>
              </div>

              <div className="record-image-box">
                {specimen.imagem_url ? (
                  <img
                    src={specimen.imagem_url}
                    alt={specimen.especie_apelido}
                  />
                ) : (
                  <div className="record-image-placeholder">
                    Imagen del ejemplar no disponible.
                  </div>
                )}
              </div>

              <div className="record-sidebar-card">
                <strong>Estado del registro</strong>
                <span>
                  Fecha de nacimiento:{" "}
                  {specimen.data_nasc
                    ? new Date(specimen.data_nasc).toLocaleDateString("pt-BR")
                    : "No informado"}
                </span>
              </div>

              <div className="record-sidebar-card">
                <strong>Identificación</strong>
                <span>Código: {specimen.cod_exemplar}</span>
              </div>

              <div className="record-sidebar-card">
                <strong>Observación general</strong>
                <span>
                  {specimen.marcas_distintivas ||
                    "Sin observaciones complementarias registradas hasta el momento."}
                </span>
              </div>
            </div>
          </aside>

          <section className="record-main">
            <div className="record-main-inner">
              <div className="record-top-card">
                <h2>Resumen del ajolote</h2>
                <p>
                  Esta página centraliza las informaciones principales del
                  ejemplar registrado en el sistema, incluyendo características
                  físicas, condiciones de seguimiento y acuario asociado.
                </p>

                <div className="record-selected-summary">
                  <strong>Resumen rápido</strong>

                  <div className="record-summary-grid">
                    <div className="record-summary-item">
                      <span>Especie</span>
                      <strong>{specimen.nome_cientifico}</strong>
                    </div>

                    <div className="record-summary-item">
                      <span>Color</span>
                      <strong>
                        {specimen.marcas_distintivas || "No informado"}
                      </strong>
                      <strong>{specimen.cor || "No informado"}</strong>
                    </div>

                    <div className="record-summary-item">
                      <span>Peso</span>
                      {resumo.peso ? (
                        <strong>{resumo.peso} g</strong>
                      ) : (
                        <strong>No informado</strong>
                      )}
                    </div>

                    <div className="record-summary-item">
                      <span>Código</span>
                      <strong>{specimen.cod_exemplar}</strong>
                    </div>

                    <div className="record-summary-item">
                      <span>Sexo</span>
                      <strong>{specimen?.sexo || "No informado"}</strong>
                    </div>

                    <div className="record-summary-item">
                      <span>Etapa de vida</span>
                      <strong>{specimen.lifeStage || "No informado"}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="record-success">
                <AiOutlineCheckCircle style={{ marginRight: 8 }} />
                Registro validado y asociado al histórico más reciente del
                ejemplar.
              </div>

              <div className="details-grid">
                <div className="detail-card">
                  <div className="detail-card__header">
                    <TbHeartbeat className="detail-card__icon" />
                    <h3>Características biológicas</h3>
                  </div>

                  <div className="detail-list">
                    <div className="detail-row">
                      <span>Nombre</span>
                      <strong>{specimen.especie_apelido}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Especie</span>
                      <strong>{specimen.nome_cientifico}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Coloración</span>
                      <strong>
                        {specimen.marcas_distintivas || "No informado"}
                      </strong>
                      <strong>{specimen.cor || "No informado"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Peso</span>
                      {resumo.peso ? (
                        <strong>{resumo.peso} g</strong>
                      ) : (
                        <strong>No informado</strong>
                      )}
                    </div>
                    <div className="detail-row">
                      <span>Tamaño</span>
                      {resumo.peso ? (
                        <strong>{resumo.tamanho} cm</strong>
                      ) : (
                        <strong>No informado</strong>
                      )}
                    </div>
                    <div className="detail-row">
                      <span>Sexo</span>
                      <strong>{specimen.sexo || "No informado"}</strong>
                    </div>
                  </div>
                </div>

                <div className="detail-card">
                  <div className="detail-card__header">
                    <AiOutlineCalendar className="detail-card__icon" />
                    <h3>Seguimiento</h3>
                  </div>

                  <div className="detail-list">
                    <div className="detail-row">
                      <span>Último registro válido</span>
                      <strong>
                        {specimen.data_nasc
                          ? new Date(specimen.data_nasc).toLocaleDateString(
                              "pt-BR",
                            )
                          : "No informado"}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Fecha de nacimiento</span>
                      <strong>
                        {specimen.data_nasc
                          ? new Date(specimen.data_nasc).toLocaleDateString(
                              "pt-BR",
                            )
                          : "No informado"}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Estado clínico</span>
                      <strong>
                        {specimen.esta_vivo ? "Estable" : "Óbito"}
                      </strong>
                    </div>
                    <div className="detail-row">
                      <span>Alimentación</span>
                      <strong>{resumo.feeding || "No informado"}</strong>
                    </div>
                    <div className="detail-row">
                      <span>Última observación</span>
                      <strong>
                        {specimen.lastObservation || "Sin registro"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="detail-card detail-card--full">
                  <div className="detail-card__header">
                    <HiOutlineBeaker className="detail-card__icon" />
                    <h3>Acuario actual</h3>
                  </div>

                  {tank ? (
                    <div className="detail-tank-grid">
                      <div className="detail-mini">
                        <FiMapPin className="detail-mini__icon" />
                        <div>
                          <span>Ubicación</span>
                          <strong>{tank.localizacao}</strong>
                        </div>
                      </div>

                      <div className="detail-mini">
                        <PiDropFill className="detail-mini__icon" />
                        <div>
                          <span>Volumen</span>
                          <strong>{tank.volume_nominal} L</strong>
                        </div>
                      </div>

                      <div className="detail-mini">
                        <MdStraighten className="detail-mini__icon" />
                        <div>
                          <span>Rango térmico</span>
                          <strong>{tank.tipo_tanque || "No informado"}</strong>
                        </div>
                      </div>

                      <div className="detail-mini">
                        <HiOutlineBeaker className="detail-mini__icon" />
                        <div>
                          <span>Nombre del acuario</span>
                          <strong>{tank.codigo_tanque}</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="detail-empty">Acuario no encontrado.</p>
                  )}
                </div>

                <div className="detail-card detail-card--full">
                  <div className="detail-card__header">
                    <FaWeightHanging className="detail-card__icon" />
                    <h3>Descripción complementaria</h3>
                  </div>

                  <p className="detail-description">
                    {specimen.marcas_distintivas ||
                      "Este ejemplar aún no tiene descripción detallada."}
                  </p>
                </div>

                <div className="detail-card detail-card--full">
                  <div className="detail-card__header">
                    <FaWeightHanging className="detail-card__icon" />
                    <h3>Evolución del ejemplar</h3>
                  </div>

                  {history.length > 0 ? (
                    <GraficoAxolote data={history} />
                  ) : (
                    <p className="detail-empty">Sin datos de histórico.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
