//Importando hook para controle de estado local.
import { useState } from "react";

//Importando contexto da carteira para acessar endereço e conexão.
import { useWallet } from "../../context/WalletContext";

//Importando ethers para interação com blockchain Ethereum.
import { ethers } from "ethers";

//Importando endereço do contrato e ABI para chamadas on-chain.
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";

//Importando componente de layout padrão da aplicação.
import PageLayout from "../components/layout/PageLayout";

//Importando biblioteca SweetAlert2 para feedback visual.
import Swal from "sweetalert2";

//Importando estilos da página de criação de instituição.
import "../styles/criarInstituicao.css";

//Função auxiliar para normalizar domínio ENS.
const normalizeDomain = (domain) => {
  //Converte domínio para minúsculo e remove espaços.
  let d = domain.toLowerCase().trim();

  //Garante extensão .eth no final do domínio.
  if (!d.endsWith(".eth")) d += ".eth";

  return d;
};

//Componente principal de criação de instituição.
export default function CriarInstituicao() {
  //Obtém dados da wallet e função de conexão.
  const { walletAddress, connectWallet } = useWallet();

  //Estado para nome da instituição.
  const [nome, setNome] = useState("");

  //Estado para domínio ENS da instituição.
  const [dominio, setDominio] = useState("");

  //Estado para carteira do administrador inicial.
  const [adminWallet, setAdminWallet] = useState("");

  //Estado para mensagens de status da operação.
  const [status, setStatus] = useState("");

  //Função responsável por criar instituição na blockchain e backend.
  const criarInstituicao = async () => {
    try {
      //Validação de campos obrigatórios.
      if (!nome || !dominio || !adminWallet) {
        throw new Error("Complete todos los campos");
      }

      //Validação de endereço Ethereum.
      if (!ethers.isAddress(adminWallet)) {
        throw new Error("Dirección del admin inválida");
      }

      //Exibe loading inicial.
      Swal.fire({
        title: "Procesando...",
        html: "Preparando creación de la institución",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      //Cria provider da blockchain via MetaMask.
      const provider = new ethers.BrowserProvider(window.ethereum);

      //Obtém signer da carteira conectada.
      const signer = await provider.getSigner();

      //Instancia contrato inteligente.
      const contract = new ethers.Contract(
        USER_ACCESS,
        USER_ACCESS_ABI,
        signer
      );

      //Normaliza domínio ENS.
      const normalized = normalizeDomain(dominio);

      //Gera node hash do ENS.
      const parentNode = ethers.namehash(normalized);

      //Atualiza mensagem de status.
      Swal.update({ html: "Verificando permisos..." });

      //Verifica se usuário tem permissão de PLATFORM_ADMIN.
      const hasRole = await contract.hasRole(
        await contract.PLATFORM_ADMIN_ROLE(),
        walletAddress
      );

      if (!hasRole) {
        throw new Error("No eres PLATFORM_ADMIN");
      }

      //Atualiza status de verificação ENS.
      Swal.update({ html: "Validando dominio ENS..." });

      //Obtém resolver do ENS.
      const resolver = await provider.getResolver(normalized);

      if (!resolver) {
        throw new Error("Dominio ENS sin resolver configurado");
      }

      //Atualiza status de transação.
      Swal.update({ html: "Enviando transacción de creación..." });

      //Executa criação da instituição na blockchain.
      const tx = await contract.createInstitution(
        parentNode,
        nome,
        adminWallet
      );

      console.log("[DEBUG] TX HASH (create):", tx.hash);

      //Atualiza status com hash da transação.
      Swal.update({
        html: `Transacción enviada!<br/>Hash:<br/><small>${tx.hash}</small><br/><br/>Esperando confirmación...`,
      });

      //Aguarda confirmação da transação.
      await tx.wait();

      //Obtém ID da instituição criada.
      const institutionId =
        await contract.institutionByParentNode(parentNode);

      if (institutionId == 0) {
        throw new Error("Fracaso en la creación de una institución");
      }

      //Atualiza status de ativação.
      Swal.update({ html: "Activando la institución..." });

      //Ativa instituição na blockchain.
      const tx2 = await contract.setInstitutionStatus(
        institutionId,
        true
      );

      console.log("[DEBUG] TX HASH (status):", tx2.hash);

      //Atualiza status com hash da ativação.
      Swal.update({
        html: `¡Activación enviada!<br/>Hash:<br/><small>${tx2.hash}</small><br/><br/>Confirmando...`,
      });

      //Aguarda confirmação da ativação.
      await tx2.wait();

      //Atualiza status antes de salvar no backend.
      Swal.update({ html: "Salvando no backend..." });

      //Salva instituição no backend.
      await fetch("http://localhost:3000/instituicoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          dominio: normalized,
          admin: adminWallet,
          createdBy: walletAddress,
          blockchain_id: Number(institutionId),
        }),
      });

      //Exibe sucesso final.
      Swal.fire({
        icon: "success",
        title: "Instituição criada!",
        html: `
          <p>A instituição foi criada com sucesso!</p>
          <p><b>ID:</b> ${institutionId}</p>
          <p><b>TX criação:</b><br/><small>${tx.hash}</small></p>
          <p><b>TX ativação:</b><br/><small>${tx2.hash}</small></p>
        `,
        confirmButtonText: "OK",
      });

      setStatus("Institución creada con éxito!");
    } catch (err) {
      console.error(err);

      //Exibe erro caso algo falhe.
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.reason || err.message,
      });

      setStatus(err.reason || err.message);
    }
  };

  //Caso não tenha wallet conectada, exibe botão de conexão.
  if (!walletAddress) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px" }}>
        <button className="btn-primary" onClick={connectWallet}>
          Conectar MetaMask
        </button>
      </div>
    );
  }

  return (
    //Layout principal da página.
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerTitle="Crear Institución ENS"
      bannerSubtitle="Registra una nueva institución en la blockchain y vincula su dominio ENS."
      bannerVariant="blue"
    >
      {/*Container do formulário*/}
      <div className="form-wrapper">
        <div className="form-card">

          {/*Cabeçalho do formulário*/}
          <div className="form-header">
            <h2 className="form-title">Nueva Institución</h2>
            <p className="form-subtitle">
              Complete los datos para registrar la institución en la red
            </p>
          </div>

          {/*Input nome instituição*/}
          <input
            className="input"
            placeholder="Nombre de la institución"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          {/*Input domínio ENS*/}
          <input
            className="input"
            placeholder="Domínio ENS (ex: axolodao.axolove.eth)"
            value={dominio}
            onChange={(e) => setDominio(e.target.value)}
          />

          {/*Input wallet admin*/}
          <input
            className="input"
            placeholder="Billetera de admin inicial"
            value={adminWallet}
            onChange={(e) => setAdminWallet(e.target.value)}
          />

          {/*Botão de criação*/}
          <button className="btn-primary" onClick={criarInstituicao}>
            Crear Institución
          </button>

          {/*Status da operação*/}
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </PageLayout>
  );
}