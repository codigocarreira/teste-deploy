import "../styles/home.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import CardAxolote from "../components/ui/CardAxolote";
import CardAquario from "../components/ui/CardAquario";
import axoloveAdmin from "../assets/axoloveAdmin.png";
import { useAxolotes } from "../../hooks/useAxolotes";
import { useAquarios } from "../../hooks/useAquarios";
import BotaoExportarExcel from "../components/ui/BotaoExport";

function Home() {
  const navigate = useNavigate();
  const { axolotes } = useAxolotes();
  const { aquarios } = useAquarios();
  const [resumos, setResumos] = useState({});

  useEffect(() => {
    async function carregarResumos() {
      const resultados = {};

      await Promise.all(
        axolotes.map(async (ax) => {
          try {
            const res = await fetch(
              `http://localhost:3000/registros/axolote/${ax.id}/resumo`,
            );

            if (res.ok) {
              const data = await res.json();
              resultados[ax.id] = data.resumo;
            }
          } catch (err) {
            console.error("Erro ao buscar resumo:", err);
          }
        }),
      );

      setResumos(resultados);
    }

    if (axolotes.length > 0) {
      carregarResumos();
    }
  }, [axolotes]);
  return (
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerSideImage={axoloveAdmin}
      bannerTitle="Bienvenido a Axolove"
      bannerSubtitle="Un registro científico descentralizado con trazabilidad, validación y acceso seguro a datos científicos."
      bannerVariant="blue"
    >
      <div className="home-section-header">
        <h2 className="home-section-title">Axolotes Destacados</h2>
        <p className="home-section-subtitle">
          Explora algunos registros validados de la plataforma.
        </p>
      </div>

      <div className="list-cards-axolote">
        {axolotes.map((ax, index) => (
          <CardAxolote
            key={ax.id}
            specimenId={ax.id}
            theme={
              index % 3 === 0 ? "pink" : index % 3 === 1 ? "green" : "orange"
            }
            image={ax.imagem_url || "/axl_1.png"}
            name={ax.especie_apelido}
            species={ax.nome_cientifico}
            code={ax.cod_exemplar}
            color={ax.cor}
            sex={ax.sexo}
            isAlive={ax.esta_vivo}
            tankId={ax.fk_aquario_id}
            birthDate={ax.data_nasc}
            onchainEntityId={ax.onchain_entity_id}
            onKnowMore={() => navigate(`/axolote/${ax.id}`)}
          />
        ))}
      </div>

      <div className="home-section-header home-section-header--spaced">
        <h2 className="home-section-title">Tanques destacados</h2>
        <p className="home-section-subtitle">
          Accede a la información ambiental y a las condiciones actuales del
          tanque.
        </p>
      </div>

      <div className="list-cards-axolote">
        {aquarios.map((tank, index) => (
          <CardAquario
            key={tank.id}
            tankId={tank.id}
            theme={
              index % 3 === 0 ? "blue" : index % 3 === 1 ? "teal" : "violet"
            }
            image={tank.imagem_url || "/axl_1.png"}
            name={tank.localizacao || `Tanque #${tank.id}`}
            code={tank.codigo_tanque}
            species={tank.lista_especies}
            location={tank.localizacao}
            volumeNominal={tank.volume_nominal}
            volumeEfetivo={tank.volume_efetivo}
            quantity={tank.quant_exemplares}
            tankType={tank.tipo_tanque}
            onKnowMore={() => navigate(`/tank/${tank.id}`)}
          />
        ))}
      </div>

      <div>
        <BotaoExportarExcel />
      </div>
    </PageLayout>
  );
}

export default Home;
