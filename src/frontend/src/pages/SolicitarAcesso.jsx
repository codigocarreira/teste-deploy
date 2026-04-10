import { useWallet } from "../../context/WalletContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { getParentENS } from "../utils/ensParse";

// Importação dos componentes de Layout e UI do seu projeto
import PageLayout from "../components/layout/PageLayout";
import axoloveAdmin from "../assets/axoloveAdmin.png"; 

export default function SolicitarAcesso() {
  const navigate = useNavigate();
  const { user, walletAddress } = useWallet();
  const [role, setRole] = useState("OPERATOR");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define se os dados da blockchain ainda estão sendo carregados pelo context
  const isSyncing = !user?.blockchainInstitutionId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Bloqueia o envio se a sincronização com a blockchain não estiver concluída
    if (isSyncing) {
      return Swal.fire({
        title: "Please Wait",
        text: "We are still synchronizing your data with the blockchain.",
        icon: "info",
        confirmButtonColor: "#4f46e5"
      });
    }

    setIsSubmitting(true);
    const parentENS = getParentENS(user.ens);

    try {
      const res = await fetch("http://localhost:3000/solicitacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.ens,
          wallet: walletAddress,
          role,
          blockchainInstitutionId: user.blockchainInstitutionId,
          ens: parentENS
        })
      });

      if (res.ok) {
        Swal.fire({
          title: "Request Sent!",
          text: "Your access request has been forwarded for institutional audit.",
          icon: "success",
          confirmButtonColor: "#4f46e5"
        });
        navigate("/");
      } else {
        throw new Error();
      }
    } catch (err) {
      Swal.fire("Error", "Failed to submit request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerSideImage={axoloveAdmin}
      bannerTitle="Access Management"
      bannerSubtitle="Request specific permissions to start managing or auditing scientific records."
      bannerVariant="blue"
    >
      {/* Cabeçalho da seção seguindo o padrão da Home */}
      <div className="home-section-header">
        <h2 className="home-section-title">Identity Configuration</h2>
        <p className="home-section-subtitle">
          Identity linked to: <strong>{user?.ens || "Synchronizing..."}</strong>
        </p>
      </div>

      {/* Container centralizado com o estilo de card do Axolove */}
      <div style={{ 
        maxWidth: "600px", 
        margin: "0 auto 40px auto", 
        background: "#fff", 
        padding: "40px", 
        borderRadius: "24px", 
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)" 
      }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Campo de seleção de Role */}
          <div className="field">
            <label style={{ fontWeight: "600", marginBottom: "8px", display: "block", color: "#2d3748" }}>
              Select your desired Role
            </label>
            <select 
              id="role-select"
              name="role"
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                fontSize: "1rem",
                backgroundColor: "#f8fafc"
              }}
            >
              <option value="OPERATOR">Operator (Registration & Measurements)</option>
              <option value="VALIDATOR">Validator (On-chain Auditing)</option>
              <option value="ADMIN">Administrator (Node Management)</option>
            </select>
          </div>

          {/* Box de informações institucionais (muda de cor se estiver sincronizando) */}
          <div style={{ 
            backgroundColor: isSyncing ? "#fffbeb" : "#f1f5f9", 
            padding: "15px", 
            borderRadius: "12px", 
            fontSize: "0.85rem",
            color: "#64748b",
            border: isSyncing ? "1px solid #fef3c7" : "1px solid #e2e8f0"
          }}>
            {isSyncing ? (
              <span style={{ color: "#b45309" }}>⚠️ Waiting for blockchain synchronization...</span>
            ) : (
              <>
                <strong>Connected Wallet:</strong><br/>
                <code style={{ color: "#1e293b" }}>{walletAddress}</code><br/><br/>
                <strong>Institutional Parent:</strong><br/>
                <span style={{ color: "#1e293b" }}>{getParentENS(user?.ens) || "Detecting..."}</span>
              </>
            )}
          </div>

          {/* Botão de ação principal */}
          <button 
            type="submit" 
            disabled={isSubmitting || isSyncing}
            style={{
              backgroundColor: (isSubmitting || isSyncing) ? "#cbd5e0" : "#2d3748",
              color: "white",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: (isSubmitting || isSyncing) ? "not-allowed" : "pointer",
              transition: "opacity 0.2s"
            }}
          >
            {isSyncing ? "Syncing Network..." : isSubmitting ? "Processing..." : "Confirm Access Request"}
          </button>
          
          {/* Botão para cancelar e retornar */}
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            style={{ 
              background: "none", 
              border: "none", 
              color: "#94a3b8", 
              cursor: "pointer", 
              textDecoration: "underline" 
            }}
          >
            Cancel and return
          </button>
        </form>
      </div>
    </PageLayout>
  );
}