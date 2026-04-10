import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AiOutlineArrowLeft,
  AiOutlineCheckCircle,
  AiOutlineCalendar,
} from "react-icons/ai";
import { FiMapPin } from "react-icons/fi";
import { TbTemperature } from "react-icons/tb";
import { LuWaves } from "react-icons/lu";
import { HiOutlineBeaker } from "react-icons/hi2";
import { MdOutlineScience } from "react-icons/md";
import "../styles/aquarioDetails.css";
import { GraficoTemperatura } from "../components/ui/GraficoTemperatura";
import { GraficoPH } from "../components/ui/GraficoPh";

function AquarioDetails() {
  const navigate = useNavigate();
  const { tankId } = useParams();
  const [tank, setTank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  //Buscando aquario do backend.
  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch("https://axolove-deploy-1004.onrender.com/aquarios");
        if (!res.ok) throw new Error("Erro ao buscar aquarios");
        const data = await res.json();
        const found = data.find((a) => String(a.id) === String(tankId));
        setTank(found || null);

        const resHist = await fetch(
          `https://axolove-deploy-1004.onrender.com/registros/aquario/${tankId}/temperaturaEph`,
        );

        if (resHist.ok) {
          const hist = await resHist.json();
          const histFormatado = hist.map((item) => ({
            ...item,
            data: new Date(item.data).toLocaleDateString("pt-BR"),
          }));

          setHistory(histFormatado);

          console.log("Histórico acuario:", hist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [tankId]);

  if (loading) {
    return (
      <main className="tank-page">
        <div className="tank-page__content">
          <div className="tank-page__notfound">
            <p>Cargando...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!tank) {
    return (
      <main className="tank-page">
        <div className="tank-page__content">
          <div className="tank-page__notfound">
            <h2>Acuario no encontrado</h2>
            <p>No fue posible localizar el tanque solicitado.</p>
            <button
              className="tank-back-button dark"
              onClick={() => navigate(-1)}
            >
              Volver
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="tank-page">
      <div className="tank-page__content">
        <div className="tank-layout">
          <aside className="tank-sidebar">
            <div className="tank-sidebar__inner">
              <button className="tank-back-button" onClick={() => navigate(-1)}>
                <AiOutlineArrowLeft />
                <span>Volver</span>
              </button>

              <span className="tank-badge">Registro del acuario</span>

              <div>
                <h1>{tank.codigo_tanque}</h1>
                <p>
                  Visualización detallada del ambiente, parámetros principales y
                  ejemplares actualmente asociados al tanque.
                </p>
              </div>

              <div className="tank-image-box">
                {tank.imagem_url ? (
                  <img src={tank.imagem_url} alt={tank.codigo_tanque} />
                ) : (
                  <div className="tank-image-placeholder">
                    Imagen del acuario no disponible.
                  </div>
                )}
              </div>

              <div className="tank-sidebar-card">
                <strong>Status</strong>
                <span>{tank.tipo_tanque || "Ativo"}</span>
              </div>

              <div className="tank-sidebar-card">
                <strong>Código</strong>
                <span>{tank.codigo_tanque}</span>
              </div>

              <div className="tank-sidebar-card">
                <strong>Observaciones</strong>
                <span>
                  {tank.descricao_marca_modelo || "Sin observaciones"}
                </span>
              </div>
            </div>
          </aside>

          <section className="tank-main">
            <div className="tank-main__inner">
              <div className="tank-top-card">
                <h2>Resumen del acuario</h2>
                <p>
                  Esta página reune información ambiental, operacional y de
                  asignación de los ejemplares registrados en el sistema.
                </p>

                <div className="tank-summary-grid">
                  <div className="tank-summary-item">
                    <span>Nombre</span>
                    <strong>{tank.codigo_tanque}</strong>
                  </div>
                  <div className="tank-summary-item">
                    <span>Código</span>
                    <strong>{tank.codigo_tanque}</strong>
                  </div>
                  <div className="tank-summary-item">
                    <span>Especie principal</span>
                    <strong>{tank.lista_especies}</strong>
                  </div>
                  <div className="tank-summary-item">
                    <span>Ubicación</span>
                    <strong>{tank.localizacao}</strong>
                  </div>
                  <div className="tank-summary-item">
                    <span>Volumen</span>
                    <strong>{tank.volume_nominal} L</strong>
                  </div>
                  <div className="tank-summary-item">
                    <span>Tipo</span>
                    <strong>{tank.tipo_tanque}</strong>
                  </div>
                </div>
              </div>

              <div className="tank-cards-grid">
                <div className="tank-detail-card">
                  <div className="tank-detail-card__header">
                    <HiOutlineBeaker className="tank-detail-card__icon" />
                    <h3>Parámetros del ambiente</h3>
                  </div>

                  <div className="tank-detail-list">
                    <div className="tank-detail-row">
                      <span>Volumen</span>
                      <strong>{tank.volume_nominal} L</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Tipo de tanque</span>
                      <strong>{tank.tipo_tanque}</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Tipo de sistema</span>
                      <strong>{tank.tipo_sistema}</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Tipo de aireador</span>
                      <strong>{tank.tipo_aireador}</strong>
                    </div>
                  </div>
                </div>

                <div className="tank-detail-card">
                  <div className="tank-detail-card__header">
                    <MdOutlineScience className="tank-detail-card__icon" />
                    <h3>Infraestructura</h3>
                  </div>

                  <div className="tank-detail-list">
                    <div className="tank-detail-row">
                      <span>Filtración</span>
                      <strong>{tank.tipo_filtro}</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Sustrato</span>
                      <strong>{tank.tipo_sustrato}</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Ejemplares</span>
                      <strong>{tank.quant_exemplares}</strong>
                    </div>
                    <div className="tank-detail-row">
                      <span>Marca/Modelo</span>
                      <strong>{tank.descricao_marca_modelo}</strong>
                    </div>
                  </div>
                </div>

                <div className="tank-detail-card tank-detail-card--full">
                  <div className="tank-detail-card__header">
                    <FiMapPin className="tank-detail-card__icon" />
                    <h3>Contexto del acuario</h3>
                  </div>

                  <div className="tank-mini-grid">
                    <div className="tank-mini-box">
                      <FiMapPin className="tank-mini-box__icon" />
                      <div>
                        <span>Localização</span>
                        <strong>{tank.localizacao}</strong>
                      </div>
                    </div>

                    <div className="tank-mini-box">
                      <LuWaves className="tank-mini-box__icon" />
                      <div>
                        <span>Volume</span>
                        <strong>{tank.volume_nominal} L</strong>
                      </div>
                    </div>

                    <div className="tank-mini-box">
                      <TbTemperature className="tank-mini-box__icon" />
                      <div>
                        <span>Temperatura</span>
                        <strong>{tank.tipo_tanque || "Não informado"}</strong>
                      </div>
                    </div>

                    <div className="tank-mini-box">
                      <AiOutlineCalendar className="tank-mini-box__icon" />
                      <div>
                        <span>Última inspeção</span>
                        <strong>Consultar registros</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tank-detail-card tank-detail-card--full">
                  <div className="tank-detail-card__header">
                    <HiOutlineBeaker className="tank-detail-card__icon" />
                    <h3>Ejemplares asociados</h3>
                  </div>

                  <p className="tank-empty">
                    Consulta los registros de ajolote para ver los ejemplares
                    asociados.
                  </p>
                </div>

                <div className="tank-detail-card tank-detail-card--full">
                  <div className="tank-detail-card__header">
                    <MdOutlineScience className="tank-detail-card__icon" />
                    <h3>Observaciones</h3>
                  </div>

                  <p className="tank-description">
                    {tank.descricao_marca_modelo ||
                      "Sin observaciones adicionales."}
                  </p>
                </div>

                <div className="tank-detail-card tank-detail-card--full">
                  <h3>Evolución de la temperatura</h3>

                  {history.length > 0 ? (
                    <GraficoTemperatura data={history} />
                  ) : (
                    <p>Sin datos.</p>
                  )}
                </div>

                <div className="tank-detail-card tank-detail-card--full">
                  <h3>Evolución pH</h3>

                  {history.length > 0 ? (
                    <GraficoPH data={history} />
                  ) : (
                    <p>Sin datos.</p>
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

export default AquarioDetails;
