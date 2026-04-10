import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAquarios } from "../../hooks/useAquarios.js";
import { useWallet } from "../../context/WalletContext.jsx";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../config/contracts";

import Header from "../components/layout/Header";
import StatusModal from "../components/ui/StatusModal";

import logoAxolove from "../assets/logo_axolove.png";
import axoloveOperario from "../assets/axolove-operario.png";

import "../styles/axoloteForm.css";

function AxoloteForm() {
  const navigate = useNavigate();

  const [axolote, setAxolote] = useState({
    nome_cientifico: "",
    especie_apelido: "",
    cod_exemplar: "",
    data_nasc: "",
    marcas_distintivas: "",
    esta_vivo: true,
    fk_aquario_id: "",
    cor: "",
    sexo: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [imagemExemplar, setImagemExemplar] = useState(null);
  const [previewImagem, setPreviewImagem] = useState("");

  const { walletAddress, user } = useWallet();
  const { aquarios, loading } = useAquarios();

  const [sexoAxolote, setSexoAxolote] = useState("");

  const selectedAquario = useMemo(() => {
    return (
      aquarios.find((aq) => aq.id === Number(axolote.fk_aquario_id)) || null
    );
  }, [aquarios, axolote.fk_aquario_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "esta_vivo") {
      setAxolote((prev) => ({ ...prev, [name]: value === "true" }));
    } else if (name === "fk_aquario_id") {
      setAxolote((prev) => ({ ...prev, [name]: value ? Number(value) : "" }));
    } else {
      setAxolote((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImagemExemplar(null);
      setPreviewImagem("");
      return;
    }

    setImagemExemplar(file);
    setPreviewImagem(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("SUBMIT user:", user);
    console.log("SUBMIT institutionId:", user?.institutionId);
    console.log(
      "SUBMIT blockchainInstitutionId:",
      user?.blockchainInstitutionId,
    );

    try {
      setIsSubmitting(true);

      // Validações iniciais
      if (!walletAddress) {
        throw new Error(
          "Endereço de carteira não disponível. Conecte sua carteira.",
        );
      }

      if (!user?.institutionId) {
        throw new Error(
          "ID da instituição não disponível. Sincronize sua instituição.",
        );
      }

      const formData = new FormData();

      Object.keys(axolote).forEach((key) => {
        formData.append(key, axolote[key]);
      });

      if (imagemExemplar) {
        formData.append("imagem", imagemExemplar);
      }

      formData.append("operador_wallet", walletAddress);
      formData.append("fk_instituicao_id", String(user.institutionId));

      const response = await fetch("http://localhost:3000/axolotes", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || "Erro ao salvar axolote no banco");
      }

      const result = await response.json();

      //Conectando ao smart contract via MetaMask.
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        REGISTRY_ADDRESS,
        REGISTRY_ABI,
        signer,
      );

      const tx = await contract.createAxolote(user.blockchainInstitutionId);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed && parsed.name === "AxoloteCreated");

      if (!event) {
        throw new Error(
          "Não foi possível identificar o ID on-chain do axolote.",
        );
      }

      const onchainEntityId = Number(event.args.axoloteId);

      console.log("SUBMIT user:", user);
      console.log("SUBMIT institutionId:", user?.institutionId);
      console.log(
        "SUBMIT blockchainInstitutionId:",
        user?.blockchainInstitutionId,
      );

      //Salvando dados on-chain no banco.
      await fetch(
        `http://localhost:3000/axolotes/${result.axolote.id}/onchain`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cidIpfs: result.cid,
            onchainEntityId: Number(onchainEntityId),
            txHash: receipt.hash,
          }),
        },
      );

      setAxolote({
        nome_cientifico: "",
        especie_apelido: "",
        cod_exemplar: "",
        data_nasc: "",
        marcas_distintivas: "",
        esta_vivo: true,
        fk_aquario_id: "",
        cor: "",
        sexo: "",
      });

      setImagemExemplar(null);
      setPreviewImagem("");

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "¡Ajolote creado!",
        message: `Axolote criado no banco/IPFS e entidade criada na blockchain (tx: ${receipt.hash}).`,
      });
    } catch (error) {
      console.error(error);

      setStatusModal({
        isOpen: true,
        type: "error",
        title: "¡Error!",
        message: error.message || "Ocurrió un problema al crear el ajolote.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const confirmModal = () => {
    if (statusModal.type === "success") {
      navigate("/painelOperador");
      return;
    }

    closeModal();
  };

  return (
    <main className="create-page">
      <Header />

      <div className="create-content">
        <div className="create-wrapper">
          <aside className="create-sidebar">
            <div className="create-sidebar-inner">
              <button
                type="button"
                className="create-back-button"
                onClick={() => navigate(-1)}
              >
                Voltar
              </button>

              <span className="create-badge">Cadastro biológico</span>

              <div className="create-sidebar-copy">
                <h1>Crear nuevo ajolote</h1>
                <p>
                  Registra un nuevo espécimen y vincúlalo a uno de los acuarios
                  ya existentes en el sistema.
                </p>
              </div>

              <div className="create-image-box">
                <img src={axoloveOperario} alt="Axolove" />
              </div>

              <div className="create-sidebar-card">
                <strong>Antes de continuar</strong>
                <span>
                  Esta pantalla crea el ajolote de forma definitiva y lo conecta
                  con un acuario ya registrado. Verifica bien el código y la
                  fecha antes de guardar.
                </span>
              </div>

              {selectedAquario && (
                <div className="create-sidebar-card">
                  <strong>Acuario seleccionado</strong>
                  <span>
                    {selectedAquario.codigo_tanque ||
                      `Acuario #${selectedAquario.id}`}
                  </span>
                </div>
              )}
            </div>
          </aside>

          <section className="create-main">
            <form onSubmit={handleSubmit} className="create-main-inner">
              <div className="create-top-card">
                <h2>Datos principales del ajolote</h2>
                <p>
                  Completa los datos del nuevo espécimen. Los campos se enviarán
                  al backend exactamente con la misma estructura ya integrada.
                </p>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Información básica</h3>
                    <p>
                      Registra la identificación principal del espécimen y su
                      estado actual.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field">
                      <label>Nombre científico</label>
                      <input
                        type="text"
                        name="nome_cientifico"
                        placeholder="Digite el nombre científico"
                        value={axolote.nome_cientifico}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Especimen (alias)</label>
                      <input
                        type="text"
                        name="especie_apelido"
                        placeholder="Digite el alias del ejemplar"
                        value={axolote.especie_apelido}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Código del ejemplar</label>
                      <input
                        type="text"
                        name="cod_exemplar"
                        placeholder="Digite el código del ejemplar"
                        value={axolote.cod_exemplar}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Fecha de nacimiento</label>
                      <input
                        type="date"
                        name="data_nasc"
                        placeholder="Seleccione la fecha"
                        value={axolote.data_nasc}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field full">
                      <label>Marcas distintivas</label>
                      <input
                        type="text"
                        name="marcas_distintivas"
                        placeholder="Digite marcas, rasgos o detalles distintivos"
                        value={axolote.marcas_distintivas}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="field">
                      <label>Color</label>
                      <input
                        type="text"
                        name="cor"
                        placeholder="Digite el color del ajolote"
                        value={axolote.cor}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Sexo del ajolote</label>
                      <select
                        name="sexo"
                        value={axolote.sexo}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Selecione o sexo do axolote
                        </option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Vinculación y estado</h3>
                    <p>
                      Define el estado del ajolote y selecciona el acuario al
                      que será vinculado.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field">
                      <label>¿Está vivo?</label>
                      <select
                        name="esta_vivo"
                        value={String(axolote.esta_vivo)}
                        onChange={handleChange}
                        required
                      >
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                      </select>
                    </div>

                    <div className="field">
                      <label>Acuario</label>
                      <select
                        name="fk_aquario_id"
                        value={axolote.fk_aquario_id}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        <option value="">
                          {loading
                            ? "Cargando acuarios..."
                            : "Seleccione un acuario"}
                        </option>
                        {aquarios.map((aq) => (
                          <option key={aq.id} value={aq.id.toString()}>
                            {aq.codigo_tanque}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedAquario && (
                    <div className="selected-summary">
                      <strong>Resumen del acuario vinculado</strong>
                      <div className="selected-summary-grid">
                        <div className="selected-summary-item">
                          <span>ID</span>
                          <strong>{selectedAquario.id}</strong>
                        </div>
                        <div className="selected-summary-item">
                          <span>Código</span>
                          <strong>{selectedAquario.codigo_tanque}</strong>
                        </div>

                        {selectedAquario.lista_especies && (
                          <div className="selected-summary-item">
                            <span>Especie</span>
                            <strong>{selectedAquario.lista_especies}</strong>
                          </div>
                        )}

                        {selectedAquario.localizacao && (
                          <div className="selected-summary-item">
                            <span>Ubicación</span>
                            <strong>{selectedAquario.localizacao}</strong>
                          </div>
                        )}

                        {selectedAquario.volume_nominal && (
                          <div className="selected-summary-item">
                            <span>Volumen</span>
                            <strong>{selectedAquario.volume_nominal} L</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Imagen del ejemplar</h3>
                    <p>
                      Sube una imagen para referencia visual del ajolote. Esta
                      imagen será solo local por ahora.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field full">
                      <label>Subir imagen</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <small>Formatos sugeridos: JPG, PNG o WEBP.</small>
                    </div>
                  </div>

                  {previewImagem && (
                    <div className="image-preview-card">
                      <strong>Vista previa</strong>
                      <div className="image-preview-box">
                        <img
                          src={previewImagem}
                          alt="Vista previa del ejemplar"
                        />
                      </div>
                      {imagemExemplar && (
                        <span className="image-preview-name">
                          {imagemExemplar.name}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="create-actions">
                <button
                  type="button"
                  className="ghost-btn"
                  onClick={() => {
                    setAxolote({
                      nome_cientifico: "",
                      especie_apelido: "",
                      cod_exemplar: "",
                      data_nasc: "",
                      marcas_distintivas: "",
                      esta_vivo: true,
                      fk_operador_id: "",
                      fk_aquario_id: "",
                      cor: "",
                      sexo: "",
                    });
                    setImagemExemplar(null);
                    setPreviewImagem("");
                  }}
                  disabled={isSubmitting}
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creando ajolote..." : "Registrar ajolote"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        confirmLabel={statusModal.type === "success" ? "Ir al panel" : "Cerrar"}
        onClose={closeModal}
        onConfirm={confirmModal}
      />
    </main>
  );
}

export default AxoloteForm;
