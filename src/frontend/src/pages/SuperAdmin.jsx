import { useState, useEffect } from "react";
import { useWallet } from "../../context/WalletContext";
import { ethers } from "ethers";
import Swal from "sweetalert2";

import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";
import PageLayout from "../components/layout/PageLayout";

export default function SuperAdminPanel() {
  const { walletAddress, user, connectWallet } = useWallet();

  const roles = user?.roles || {};
  const [adminRequests, setAdminRequests] = useState([]);

  useEffect(() => {
    fetchAdminRequests();
  }, []);

  const fetchAdminRequests = async () => {
    try {
      const query = roles.superAdmin
        ? "superAdminRole=true"
        : `institutionId=${user.institutionId}`;

      const res = await fetch(
        `https://axolove-deploy-1004.onrender.com/solicitacoes/notificacoes?${query}`
      );

      const data = await res.json();
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
        signer
      );

      await (
        await contract.grantAdmin(
          req.blockchain_institution_id,
          req.carteira_metamask
        )
      ).wait();

      await fetch("https://axolove-deploy-1004.onrender.com/solicitacoes/aprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: req.id }),
      });

      Swal.fire("Éxito", "Administrador aprobado!", "success");
      fetchAdminRequests();
    } catch (err) {
      Swal.fire("Error", err.reason || err.message, "error");
    }
  };

  const handleReject = async (id) => {
    await fetch("https://axolove-deploy-1004.onrender.com/solicitacoes/rejeitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solicitacaoId: id }),
    });

    fetchAdminRequests();
  };

  return (
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerTitle="Panel de Super Administración"
      bannerSubtitle="Gestión global de instituciones y administradores"
      bannerVariant="blue"
    >
      {!walletAddress && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button className="btn-primary" onClick={connectWallet}>
            Conectar MetaMask
          </button>
        </div>
      )}

      {walletAddress && roles.superAdmin && (
        <>
          {/* HEADER PADRÃO IGUAL ADMIN */}
          <div className="home-section-header">
            <h2 className="home-section-title">
              Solicitudes de administradores
            </h2>
            <p className="home-section-subtitle">
              Revisión global de accesos pendientes
            </p>
          </div>

          {/* LISTA PADRÃO DE CARDS */}
          <div className="list-cards-axolote">
            {adminRequests.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8" }}>
                No hay solicitudes pendientes
              </p>
            ) : (
              adminRequests.map((req) => (
                <div className="card" key={req.id}>
                  <strong>{req.nome_usuario}</strong>
                  <p>{req.ens}</p>
                  <code>{req.carteira_metamask}</code>

                  <div style={{ display: "flex", gap: "10px" }}>
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
              ))
            )}
          </div>
        </>
      )}
    </PageLayout>
  );
}