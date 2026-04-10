import { useState, useEffect } from "react";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";
import Header from "../components/layout/Header";
import "../styles/superAdmin.css";
import Swal from "sweetalert2";

export default function SuperAdminPanel() {
  const { walletAddress, user, connectWallet } = useWallet();
  const roles = user?.roles || {};

  const [institutions, setInstitutions] = useState([]);
  const [adminRequests, setAdminRequests] = useState([]);

  useEffect(() => {
    fetchInstitutions();
    fetchAdminRequests();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const res = await fetch("https://axolove-deploy-1004.onrender.com/instituicoes");
      const data = await res.json();
      setInstitutions(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const query = roles.superAdmin
        ? "superAdminRole=true"
        : `institutionId=${user.institutionId}`;

      const res = await fetch(
        `https://axolove-deploy-1004.onrender.com/solicitacoes/notificacoes?${query}`,
      );
      const data = await res.json();
      console.log("===== DEBUG NOTIFICAÇÕES FRONTEND =====", data);
      setAdminRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (req) => {
    try {
      Swal.fire({
        title: "Procesando...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        USER_ACCESS,
        USER_ACCESS_ABI,
        signer,
      );
      const institutionId = req.blockchain_institution_id;

      await (
        await contract.grantAdmin(institutionId, req.carteira_metamask)
      ).wait();

      await fetch("https://axolove-deploy-1004.onrender.com/solicitacoes/aprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: req.id }),
      });

      Swal.fire("Éxito", "Admin aprobado!", "success");
      fetchAdminRequests();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.reason || err.message,
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await fetch("https://axolove-deploy-1004.onrender.com/solicitacoes/rejeitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: id }),
      });
      fetchAdminRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page">
      {!walletAddress && (
        <div className="center-box">
          <button className="btn-primary" onClick={connectWallet}>
            Conectar MetaMask
          </button>
        </div>
      )}

      {walletAddress && roles.superAdmin && (
        <div className="page-content">
          <Header />

          <div className="card">
            <h2 className="title">Solicitudes de Admin</h2>

            {adminRequests.length === 0 && <p>Ninguna solicitud pendiente</p>}

            {adminRequests.map((req) => (
              <div key={req.id} className="request-card">
                <p>
                  <strong>{req.nome_usuario}</strong>
                </p>
                <p>{req.carteira_metamask}</p>
                <p>{req.ens}</p>

                <div className="actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleApprove(req)}
                  >
                    Aprobar
                  </button>

                  <button
                    className="btn-danger"
                    onClick={() => handleReject(req.id)}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
