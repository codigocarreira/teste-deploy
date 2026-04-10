import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../../context/WalletContext.jsx";
import { REGISTRY_ADDRESS, REGISTRY_ABI } from "../config/contracts";

import Header from "../components/layout/Header";
import StatusModal from "../components/ui/StatusModal";

import "../styles/aquarioForm.css";
import logoAxolove from "../assets/logo_axolove.png";
import axoloveOperario from "../assets/axolove-operario.png";

function AquarioForm({ atualizarLista = () => {} }) {
  const navigate = useNavigate();
  const { walletAddress, user } = useWallet();

  const initialForm = {
    codigo_tanque: "",
    localizacao: "",
    volume_nominal: "",
    volume_efetivo: "",
    altura_nominal: "",
    altura_efetiva: "",
    largura: "",
    comprimento: "",
    tipo_tanque: "",
    tipo_sistema: "",
    tipo_sustrato: "",
    tipo_filtro: "",
    tipo_aireador: "",
    descricao_marca_modelo: "",
    lista_especies: "",
    quant_exemplares: "",
  };

  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [imagemAquario, setImagemAquario] = useState(null);
  const [previewImagem, setPreviewImagem] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagem") {
      setForm((prev) => ({
        ...prev,
        imagem: files[0],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setImagemAquario(null);
      setPreviewImagem("");
      return;
    }

    setImagemAquario(file);
    setPreviewImagem(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!walletAddress) {
        throw new Error(
          "Endereço de carteira não disponível. Conecte sua carteira.",
        );
      }

      if (
        user?.blockchainInstitutionId === undefined ||
        user?.blockchainInstitutionId === null
      ) {
        throw new Error("ID da instituição na blockchain não disponível.");
      }

      if (user?.institutionId === undefined || user?.institutionId === null) {
        throw new Error(
          "ID da instituição no banco ainda não foi sincronizado.",
        );
      }

      setIsSubmitting(true);

      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key !== "imagem") {
          formData.append(key, form[key]);
        }
      });

      if (imagemAquario) {
        formData.append("imagem", imagemAquario);
      }

      formData.append("operador_wallet", walletAddress);
      formData.append("fk_instituicao_id", String(user.institutionId));

      for (const [key, value] of formData.entries()) {
        console.log("[FORMDATA]", key, value);
      }

      const response = await fetch("http://localhost:3000/aquarios", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.erro || "Erro ao salvar aquario no banco");
      }

      const result = await response.json();

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
          "Não foi possível identificar o ID on-chain da entidade.",
        );
      }

      const onchainEntityId = Number(event.args.axoloteId);

      await fetch(
        `http://localhost:3000/aquarios/${result.aquario.id}/onchain`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cidIpfs: result.cid,
            onchainEntityId,
            txHash: receipt.hash,
          }),
        },
      );

      setForm(initialForm);
      setImagemAquario(null);
      setPreviewImagem("");
      atualizarLista();

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "¡Pecera creada!",
        message: `Aquário cadastrado com sucesso. O CID foi gerado no IPFS e a entidade foi criada on-chain (tx: ${receipt.hash}).`,
      });
    } catch (error) {
      console.error(error);

      setStatusModal({
        isOpen: true,
        type: "error",
        title: "¡Error!",
        message: error.message || "Ocurrió un problema al crear la pecera.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholders = {
    codigo_tanque: "Digite el código del tanque",
    localizacao: "Digite la ubicación del acuario",
    volume_nominal: "Digite el volumen nominal",
    volume_efetivo: "Digite el volumen efectivo",
    altura_nominal: "Digite la altura nominal",
    altura_efetiva: "Digite la altura efectiva",
    largura: "Digite el ancho",
    comprimento: "Digite el largo",
    tipo_tanque: "Digite el tipo de tanque",
    tipo_sistema: "Digite el tipo de sistema",
    tipo_sustrato: "Digite el tipo de sustrato",
    tipo_filtro: "Digite el tipo de filtro",
    tipo_aireador: "Digite el tipo de aireador",
    descricao_marca_modelo: "Digite la descripción, marca o modelo",
    lista_especies: "Digite la lista de especies",
    quant_exemplares: "Digite la cantidad de ejemplares",
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

              <span className="create-badge">Cadastro estrutural</span>

              <div className="create-sidebar-copy">
                <h1>Crear nueva pecera</h1>
                <p>
                  Registra un nuevo acuario con sus dimensiones, sistema,
                  sustrato, filtración y especies vinculadas.
                </p>
              </div>

              <div className="create-image-box">
                <img src={axoloveOperario} alt="Axolove" />
              </div>

              <div className="create-sidebar-card">
                <strong>Antes de guardar</strong>
                <span>
                  Verifica las dimensiones, el tipo de sistema y la cantidad de
                  ejemplares. Estos datos serán enviados al backend exactamente
                  con la estructura ya integrada.
                </span>
              </div>

              {imagemAquario && (
                <div className="create-sidebar-card">
                  <strong>Imagen seleccionada</strong>
                  <span>{imagemAquario.name}</span>
                </div>
              )}
            </div>
          </aside>

          <section className="create-main">
            <form onSubmit={handleSubmit} className="create-main-inner">
              <div className="create-top-card">
                <h2>Datos principales de la pecera</h2>
                <p>
                  Completa la información del tanque. La lógica de envío al
                  backend se mantiene intacta.
                </p>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Identificación y ubicación</h3>
                    <p>
                      Registra los datos básicos que identifican y localizan la
                      pecera.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field">
                      <label>Código del tanque</label>
                      <input
                        name="codigo_tanque"
                        placeholder={placeholders.codigo_tanque}
                        value={form.codigo_tanque}
                        onChange={handleChange}
                        type="text"
                        required
                      />
                    </div>

                    <div className="field">
                      <label>Ubicación</label>
                      <input
                        name="localizacao"
                        placeholder={placeholders.localizacao}
                        value={form.localizacao}
                        onChange={handleChange}
                        type="text"
                        required
                      />
                    </div>

                    <div className="field full">
                      <label>Lista de especies</label>
                      <input
                        name="lista_especies"
                        placeholder={placeholders.lista_especies}
                        value={form.lista_especies}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label>Cantidad de ejemplares</label>
                      <input
                        name="quant_exemplares"
                        placeholder={placeholders.quant_exemplares}
                        value={form.quant_exemplares}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Dimensiones y volumen</h3>
                    <p>
                      Informa las medidas principales de la pecera y sus
                      volúmenes.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field">
                      <label>Volumen nominal</label>
                      <input
                        name="volume_nominal"
                        placeholder={placeholders.volume_nominal}
                        value={form.volume_nominal}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label>Volumen efectivo</label>
                      <input
                        name="volume_efetivo"
                        placeholder={placeholders.volume_efetivo}
                        value={form.volume_efetivo}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label>Altura nominal</label>
                      <input
                        name="altura_nominal"
                        placeholder={placeholders.altura_nominal}
                        value={form.altura_nominal}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label>Altura efectiva</label>
                      <input
                        name="altura_efetiva"
                        placeholder={placeholders.altura_efetiva}
                        value={form.altura_efetiva}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label>Ancho</label>
                      <input
                        name="largura"
                        placeholder={placeholders.largura}
                        value={form.largura}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>

                    <div className="field">
                      <label>Largo</label>
                      <input
                        name="comprimento"
                        placeholder={placeholders.comprimento}
                        value={form.comprimento}
                        onChange={handleChange}
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Configuración del sistema</h3>
                    <p>
                      Define el tipo de tanque, sistema, sustrato y componentes
                      de soporte.
                    </p>
                  </div>
                </div>

                <div className="create-section-body">
                  <div className="field-grid">
                    <div className="field">
                      <label>Tipo de tanque</label>
                      <input
                        name="tipo_tanque"
                        placeholder={placeholders.tipo_tanque}
                        value={form.tipo_tanque}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label>Tipo de sistema</label>
                      <input
                        name="tipo_sistema"
                        placeholder={placeholders.tipo_sistema}
                        value={form.tipo_sistema}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label>Tipo de sustrato</label>
                      <input
                        name="tipo_sustrato"
                        placeholder={placeholders.tipo_sustrato}
                        value={form.tipo_sustrato}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label>Tipo de filtro</label>
                      <input
                        name="tipo_filtro"
                        placeholder={placeholders.tipo_filtro}
                        value={form.tipo_filtro}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field">
                      <label>Tipo de aireador</label>
                      <input
                        name="tipo_aireador"
                        placeholder={placeholders.tipo_aireador}
                        value={form.tipo_aireador}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>

                    <div className="field full">
                      <label>Descripción / Marca / Modelo</label>
                      <input
                        name="descricao_marca_modelo"
                        placeholder={placeholders.descricao_marca_modelo}
                        value={form.descricao_marca_modelo}
                        onChange={handleChange}
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="create-section">
                <div className="create-section-header static">
                  <div className="create-section-title-wrap">
                    <h3>Imagen de la pecera</h3>
                    <p>
                      Sube una imagen para referencia visual del tanque. Esta
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
                          alt="Vista previa de la pecera"
                        />
                      </div>
                      {imagemAquario && (
                        <span className="image-preview-name">
                          {imagemAquario.name}
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
                    setForm(initialForm);
                    setImagemAquario(null);
                    setPreviewImagem("");
                  }}
                  disabled={isSubmitting}
                >
                  Limpiar
                </button>

                <button
                  type="submit"
                  className="primary-btn"
                  disabled={
                    isSubmitting ||
                    user?.institutionId === undefined ||
                    user?.institutionId === null
                  }
                >
                  {isSubmitting
                    ? "Creando pecera..."
                    : user?.institutionId === undefined ||
                        user?.institutionId === null
                      ? "Sincronizando institución..."
                      : "Crear pecera"}
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

export default AquarioForm;
