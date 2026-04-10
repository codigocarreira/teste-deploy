import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext.jsx";
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts.js";
import "../styles/login.css";
import Header from "../components/layout/Header/index.jsx";

function parseENS(ens) {
  const normalized = ens.toLowerCase().trim();
  const parts = normalized.split(".");

  if (parts.length < 3) {
    throw new Error("ENS inválido (mínimo: subdominio.institución.eth)");
  }

  const label = parts[0];
  const parent = parts.slice(1).join(".");

  if (!parent.endsWith(".eth")) {
    throw new Error("Parent ENS inválido (debe terminar con .eth)");
  }

  return { label, parent, full: normalized };
}

export default function LoginENS() {
  const { walletAddress, provider, signer, connectWallet, setUser } =
    useWallet();

  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [ensName, setEnsName] = useState("");
  const [loading, setLoading] = useState(false);
  const [institutionId, setInstitutionId] = useState(null);
  const [institutionStruct, setInstitutionStruct] = useState(null);
  const [isMemberActive, setIsMemberActive] = useState(false);

  useEffect(() => {
    if (!signer) return;

    const c = new ethers.Contract(USER_ACCESS, USER_ACCESS_ABI, signer);
    console.log("[DEBUG] CONTRACT ADDRESS:", USER_ACCESS);
    setContract(c);
  }, [signer]);

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.sepolia.org"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      }
    }
  };

  const checkMembership = async () => {
    if (!provider || !contract || !walletAddress || !ensName) return;

    try {
      const network = await provider.getNetwork();
      console.log("[DEBUG] chainId:", network.chainId.toString());

      if (network.chainId !== 11155111n) {
        throw new Error("Conecte su billetera a la red Sepolia");
      }

      const code = await provider.getCode(USER_ACCESS);
      console.log("[DEBUG] code at USER_ACCESS:", code);

      if (code === "0x") {
        throw new Error("Contrato USER_ACCESS no encontrado en la red actual");
      }

      const nextInstitutionId = await contract.nextInstitutionId();
      console.log("[DEBUG] nextInstitutionId:", nextInstitutionId.toString());

      const { label, parent, full } = parseENS(ensName);
      const parentNode = ethers.namehash(parent);

      console.log("[DEBUG] ENS:", full);
      console.log("[DEBUG] parent:", parent);
      console.log(parentNode);

      const instIdRaw = await contract.institutionByParentNode(parentNode);
      const instId = Number(instIdRaw.toString());

      console.log("[DEBUG] instId:", instId);

      if (!instId) {
        throw new Error("Institución no encontrada en cadena");
      }

      setInstitutionId(instId);

      const instRaw = await contract.institutions(instId);

      const inst = {
        exists: instRaw[0],
        active: instRaw[1],
        parentNode: instRaw[2],
        displayName: instRaw[3],
        createdBy: instRaw[4],
        createdAt: instRaw[5],
      };

      console.log("[DEBUG] inst:", inst);

      setInstitutionStruct(inst);

      if (!inst.exists || !inst.active) {
        throw new Error("Institución inválida o inactiva");
      }

      let ensValid = false;

      try {
        const resolver = await provider.getResolver(full);

        if (resolver) {
          const resolved = await resolver.getAddress();
          console.log("[DEBUG] resolved:", resolved);

          if (
            resolved &&
            resolved.toLowerCase() === walletAddress.toLowerCase()
          ) {
            ensValid = true;
          }
        } else {
          console.log("[DEBUG] Sem resolver ENS");
        }
      } catch (e) {
        console.log("[DEBUG] ENS erro:", e);
      }

      if (!ensValid) {
        throw new Error("ENS inválido o no pertenece a la billetera");
      }

      const memberActive = await contract.isActiveMember(instId, walletAddress);
      console.log("[DEBUG] isMember:", memberActive);
      setIsMemberActive(memberActive);

      if (memberActive) {
        const isAdmin = await contract.isInstitutionAdmin(
          instId,
          walletAddress,
        );
        const isOperator = await contract.isInstitutionOperator(
          instId,
          walletAddress,
        );
        const isValidator = await contract.isInstitutionValidator(
          instId,
          walletAddress,
        );

        const superAdminRole = await contract.hasRole(
          await contract.PLATFORM_ADMIN_ROLE(),
          walletAddress,
        );

        console.log("[DEBUG] Roles reais:", {
          isAdmin,
          isOperator,
          isValidator,
          superAdminRole,
        });

        const rolesObj = {
          admin: isAdmin,
          operator: isOperator,
          validator: isValidator,
          superAdmin: superAdminRole,
        };

        setUser({
          wallet: walletAddress,
          ens: full,
          institutionId: instId,
          blockchainInstitutionId: instId,
          roles: rolesObj,
        });

        Swal.fire("Éxito", "¡Inicio de sesión realizado!", "success");

        navigate("/");
      }
    } catch (err) {
      console.error("[DEBUG]", err);
      setIsMemberActive(false);

      Swal.fire("Erro", err.message, "error");
    }
  };

  const handleRegisterAccess = async () => {
    if (!contract || !walletAddress || !ensName || !institutionId) return;

    setLoading(true);

    try {
      const { label, parent } = parseENS(ensName);
      const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));
      const parentNode = ethers.namehash(parent);
      const tx = await contract.registerAccess(labelhash, parentNode);
      await tx.wait();

      Swal.fire("Éxito", "¡Acceso registrado!", "success");

      await checkMembership();
    } catch (err) {
      console.error(err);

      Swal.fire("Erro", err.reason || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="page">
      <Header />
      <div className="login-page">
        <div className="login-overlay" />
        <div className="login-shell">
          <div className="login-panel">
            <div className="login-brand">
              <img src="/simbol.png" alt="Axolove" className="login-logo" />
              <span className="login-badge">Acceso institucional</span>
            </div>

            <div className="login-content">
              <h1 className="login-title">Iniciar sesión con ENS</h1>
              <p className="login-subtitle">
                Conecte su billetera y valide su subdominio para acceder a la
                plataforma.
              </p>

              {!walletAddress && (
                <button
                  className="login-primary-btn"
                  onClick={async () => {
                    await switchToSepolia();
                    await connectWallet();
                  }}
                >
                  Conectar billetera
                </button>
              )}

              {walletAddress && (
                <>
                  <div className="login-wallet-box">
                    <span className="login-field-label">
                      Billetera conectada
                    </span>
                    <p className="login-wallet-value">{walletAddress}</p>
                  </div>

                  <div className="login-form-group">
                    <label className="login-label" htmlFor="ensName">
                      Subdominio ENS
                    </label>

                    <input
                      id="ensName"
                      className="login-input"
                      placeholder="ej: user.axolodao.axolove.eth"
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                    />
                  </div>

                  <button
                    className="login-primary-btn"
                    onClick={checkMembership}
                  >
                    Verificar ENS
                  </button>
                </>
              )}

              {walletAddress &&
                institutionStruct?.exists &&
                !isMemberActive && (
                  <div className="login-secondary-area">
                    <div className="login-info-card">
                      <span className="login-field-label">
                        Institución encontrada
                      </span>
                      <p className="login-info-text">
                        Su dominio fue localizado, pero el acceso aún necesita
                        ser registrado.
                      </p>
                    </div>

                    <button
                      className="login-secondary-btn"
                      onClick={handleRegisterAccess}
                      disabled={loading}
                    >
                      {loading ? "Registrando..." : "Registrar acesso"}
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
