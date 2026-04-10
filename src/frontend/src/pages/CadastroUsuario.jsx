import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";

// Componentes de Layout e assets do projeto
import PageLayout from "../components/layout/PageLayout";
import axoloveAdm from "../assets/axolove-adm.png";

export default function CadastroUsuario() {
  const { user, signer } = useWallet();
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSolicitacoes = async () => {
    try {
      if (!user?.institutionId) return;

      const res = await fetch(
        `http://localhost:3000/solicitacoes?institutionId=${user.institutionId}&status=PENDING&roles=OPERATOR,VALIDATOR`,
      );

      const data = await res.json();
      setSolicitacoes(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [user?.institutionId]);

  const aprovar = async (sol) => {
    try {
      setLoading(true);

      const contract = new ethers.Contract(
        USER_ACCESS,
        USER_ACCESS_ABI,
        signer,
      );

      Swal.fire({
        title: "Firmar transacción",
        text: "Otorgando rol en la blockchain...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      let tx;

      if (sol.role_desejada === "OPERATOR") {
        tx = await contract.grantOperator(
          user.blockchainInstitutionId,
          sol.carteira_metamask,
        );
      } else {
        tx = await contract.grantValidator(
          user.blockchainInstitutionId,
          sol.carteira_metamask,
        );
      }

      await tx.wait();

      await fetch("http://localhost:3000/solicitacoes/aprovar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: sol.id }),
      });

      Swal.fire(
        "¡Éxito!",
        "Usuario aprobado y registrado on-chain!",
        "success",
      );
      fetchSolicitacoes();
    } catch (err) {
      Swal.fire("Error de transacción", err.reason || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const rejeitar = async (id) => {
    try {
      await fetch("http://localhost:3000/solicitacoes/rejeitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ solicitacaoId: id }),
      });

      Swal.fire("Rechazado!", "La solicitud ha sido rechazada.", "success");
      fetchSolicitacoes();
    } catch {
      Swal.fire("Error", "No se pudo rechazar la solicitud.", "error");
    }
  };

  return (
    <PageLayout
      bannerBackgroundImage="/images/bg-banner.png"
      bannerSideImage={axoloveAdm}
      bannerTitle="Panel de Administración"
      bannerSubtitle="Gestiona solicitudes de acceso institucional y valida usuarios en la blockchain."
      bannerVariant="pink"
    >
      <div className="home-section-header">
        <h2 className="home-section-title">Autorizaciones pendientes</h2>
        <p className="home-section-subtitle">
          Revisa y procesa solicitudes de acceso para{" "}
          <strong>{user?.ens || "tu institución"}</strong>.
        </p>
      </div>

      {!user?.roles?.admin ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <h3>Acceso denegado</h3>
          <p>No tienes permisos administrativos para ver esta página.</p>
        </div>
      ) : (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {solicitacoes.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                marginTop: "20px",
              }}
            >
              No hay solicitudes pendientes en este momento.
            </p>
          ) : (
            solicitacoes.map((sol) => (
              <div
                key={sol.id}
                style={{
                  background: "#fff",
                  borderRadius: "24px",
                  padding: "24px",
                  marginBottom: "20px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <strong style={{ fontSize: "1.2rem", color: "#1e293b" }}>
                      {sol.nome_usuario || "Nuevo usuario"}
                    </strong>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        marginTop: "4px",
                      }}
                    >
                      ENS:{" "}
                      <span style={{ color: "#3b82f6" }}>
                        {sol.ens || "no proporcionado"}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                    }}
                  >
                    Pendiente
                  </span>
                </div>

                <div
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0" }}>
                    <b>Cartera:</b> <code>{sol.carteira_metamask}</code>
                  </p>
                  <p style={{ margin: 0 }}>
                    <b>Rol solicitado:</b>{" "}
                    <span style={{ color: "#4f46e5", fontWeight: "600" }}>
                      {sol.role_desejada}
                    </span>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={() => aprovar(sol)}
                    disabled={loading}
                    style={{
                      flex: 2,
                      background: loading ? "#cbd5e0" : "#22c55e",
                      color: "#fff",
                      border: "none",
                      padding: "14px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "filter 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.filter = "brightness(0.9)")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.filter = "brightness(1)")
                    }
                  >
                    {loading ? "Procesando..." : "Aprobar y otorgar acceso"}
                  </button>

                  <button
                    onClick={() => rejeitar(sol.id)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: "transparent",
                      color: "#ef4444",
                      border: "2px solid #fee2e2",
                      padding: "14px",
                      borderRadius: "12px",
                      fontWeight: "bold",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </PageLayout>
  );
}
