import { useState } from "react";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";
import Header from "../components/layout/Header";
import "../styles/superAdmin.css";
import Swal from "sweetalert2";

const normalizeDomain = (domain) => {
  let d = domain.toLowerCase().trim();
  if (!d.endsWith(".eth")) d += ".eth";
  return d;
};

export default function CriarInstituicao() {
  const { walletAddress, connectWallet } = useWallet();

  const [nome, setNome] = useState("");
  const [dominio, setDominio] = useState("");
  const [adminWallet, setAdminWallet] = useState("");
  const [status, setStatus] = useState("");

  const criarInstituicao = async () => {
    try {
      if (!nome || !dominio || !adminWallet) {
        throw new Error("Complete todos los campos");
      }

      if (!ethers.isAddress(adminWallet)) {
        throw new Error("Dirección del admin inválida");
      }

      Swal.fire({
        title: "Procesando...",
        html: "Preparando creación de la institución",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        USER_ACCESS,
        USER_ACCESS_ABI,
        signer,
      );

      const normalized = normalizeDomain(dominio);
      const parentNode = ethers.namehash(normalized);

      Swal.update({ html: "Verificando permisos..." });

      const hasRole = await contract.hasRole(
        await contract.PLATFORM_ADMIN_ROLE(),
        walletAddress,
      );

      if (!hasRole) {
        throw new Error("No eres PLATFORM_ADMIN");
      }

      Swal.update({ html: "Validando dominio ENS..." });
      const resolver = await provider.getResolver(normalized);

      if (!resolver) {
        throw new Error("Dominio ENS sin resolver configurado");
      }

      Swal.update({ html: "Enviando transacción de creación..." });

      const tx = await contract.createInstitution(
        parentNode,
        nome,
        adminWallet,
      );

      console.log("[DEBUG] TX HASH (create):", tx.hash);

      Swal.update({
        html: `Transacción enviada!<br/>Hash:<br/><small>${tx.hash}</small><br/><br/>Esperando confirmación...`,
      });

      await tx.wait();

      const institutionId = await contract.institutionByParentNode(parentNode);

      if (institutionId == 0) {
        throw new Error("Falha ao criar instituição");
      }

      Swal.update({ html: "Ativando instituição..." });

      const tx2 = await contract.setInstitutionStatus(institutionId, true);

      console.log("[DEBUG] TX HASH (status):", tx2.hash);

      Swal.update({
        html: `Ativação enviada!<br/>Hash:<br/><small>${tx2.hash}</small><br/><br/>Confirmando...`,
      });

      await tx2.wait();

      Swal.update({ html: "Salvando no backend..." });

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

      Swal.fire({
        icon: "success",
        title: "Instituição criada!",
        html: `
          <p>A instituição foi criada com sucesso!</p>
          <p><b>ID da instituição:</b> ${institutionId}</p>
          <p><b>Hash da transação de criação:</b><br/><small>${tx.hash}</small></p>
          <p><b>Hash da transação ativação:</b><br/><small>${tx2.hash}</small></p>
        `,
        confirmButtonText: "OK",
      });

      setStatus("Instituição criada com sucesso!");
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: "error",
        title: "Erro",
        text: err.reason || err.message,
      });

      setStatus(err.reason || err.message);
    }
  };

  if (!walletAddress) {
    return (
      <div className="center-box">
        <button className="btn-primary" onClick={connectWallet}>
          Conectar MetaMask
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-content">
        <Header />

        <div className="card">
          <h2 className="title">Criar Instituição ENS</h2>

          <input
            className="input"
            placeholder="Nome da instituição"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            className="input"
            placeholder="Domínio (ex: axolodao.axolove.eth)"
            value={dominio}
            onChange={(e) => setDominio(e.target.value)}
          />

          <input
            className="input"
            placeholder="Carteira do admin inicial"
            value={adminWallet}
            onChange={(e) => setAdminWallet(e.target.value)}
          />

          <button className="btn-primary" onClick={criarInstituicao}>
            Criar
          </button>

          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </div>
  );
}
