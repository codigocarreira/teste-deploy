import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { NavLink, useLocation } from "react-router-dom";
import { HiMenu, HiX, HiUser, HiOutlineBell } from "react-icons/hi";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { useWallet } from "../../../../context/WalletContext";
import { TbBrandRadixUi } from "react-icons/tb";

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [openNotif, setOpenNotif] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);
  const { user, walletAddress } = useWallet();
  const isWalletConnected = Boolean(walletAddress);
  const isLogged = Boolean(user);
  const roles = isLogged ? user?.roles || {} : {};
  const pathname = location.pathname;
  const isHome = pathname === "/";
  const notifRef = useRef(null);

  const shortWallet = useMemo(() => {
    if (!walletAddress) return "";
    return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  }, [walletAddress]);

  const ensName = useMemo(() => {
    return (
      user?.ensName ||
      user?.ens ||
      user?.domain ||
      user?.subdomain ||
      user?.name ||
      null
    );
  }, [user]);

  const roleLabels = useMemo(() => {
    const labels = [];
    if (roles.superAdmin) labels.push("Super Admin");
    if (roles.admin) labels.push("Admin");
    if (roles.operator) labels.push("Operador");
    if (roles.validator) labels.push("Auditor");
    return labels;
  }, [roles]);

  const pendingCount = useMemo(() => {
    if (roles.admin || roles.superAdmin) {
      return notificacoes.filter((n) => n.status === "PENDING").length;
    }

    return notificacoes.length;
  }, [notificacoes, roles]);

  const traduzirStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return "aprobado";
      case "REJECTED":
        return "rechazado";
      case "PENDING":
        return "pendiente";
      default:
        return status;
    }
  };

  const traduzirRole = (role) => {
    switch (role) {
      case "VALIDATOR":
        return "auditor";
      case "OPERATOR":
        return "operador";
      case "ADMIN":
        return "administrador";
      default:
        return role;
    }
  };

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [isMobileOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
        setOpenNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotificacoes = async () => {
    try {
      if (!user) return;

      let url = "";

      if (roles.superAdmin) {
        url = `https://axolove-deploy-1004.onrender.com/solicitacoes/notificacoes?superAdminRole=true`;
      } else if (roles.admin) {
        url = `https://axolove-deploy-1004.onrender.com/solicitacoes/notificacoes?institutionId=${user.institutionId}`;
      } else {
        url = `https://axolove-deploy-1004.onrender.com/solicitacoes/notificacoes?wallet=${walletAddress}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setNotificacoes(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!isLogged) return;

    fetchNotificacoes();
    const interval = setInterval(fetchNotificacoes, 2000);

    return () => clearInterval(interval);
  }, [user, isLogged]);

  return (
    <header className="header-wrapper">
      <div className="header-shell">
        <div className="header-inner">
          <div className="logo-area">
            <img src="./simbol.png" alt="Axolove" className="logo-img" />
          </div>

          <nav className="nav nav-desktop">
            <NavLink to="/" className={`nav-item ${isHome ? "active" : ""}`}>
              Inicio
            </NavLink>

            {!isWalletConnected && (
              <NavLink to="/login" className="nav-item">
                Conectar MetaMask
              </NavLink>
            )}

            {isLogged && roles.admin && (
              <NavLink to="/painelAdmin" className="nav-item">
                Admin
              </NavLink>
            )}

            {isLogged && roles.operator && (
              <NavLink to="/painelOperador" className="nav-item">
                Operador
              </NavLink>
            )}

            {isLogged && roles.validator && (
              <NavLink to="/painelValidador" className="nav-item">
                Auditor
              </NavLink>
            )}

            {isLogged && roles.superAdmin && (
              <>
                <NavLink to="/superAdmin" className="nav-item">
                  Crear usuarios
                </NavLink>
                <NavLink to="/criarInstituicao" className="nav-item">
                  Crear instituciones
                </NavLink>
              </>
            )}

            {isLogged &&
              !roles.operator &&
              !roles.validator &&
              !roles.admin && (
                <NavLink to="/solicitarAcesso" className="nav-item">
                  Solicitar acceso
                </NavLink>
              )}
          </nav>

          <div className="header-actions">
            {/*Notificações (pedido de papéis ou recebimento de solicitações).*/}
            {isLogged && (
              <div style={{ position: "relative", marginRight: "12px" }}>
                <button
                  onClick={() => {
                    setOpenNotif((prev) => !prev);
                    fetchNotificacoes();
                  }}
                  style={{
                    position: "relative",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    border: "1px solid rgba(0,0,0,0.1)",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: openNotif
                      ? "0 0 0 3px rgba(0,0,0,0.05)"
                      : "0 2px 6px rgba(0,0,0,0.08)",
                  }}
                >
                  <HiOutlineBell size={18} style={{ color: "#3b82f6" }} />

                  {pendingCount > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: "-4px",
                        right: "-4px",
                        background: "#ff3b3b",
                        color: "#fff",
                        fontSize: "10px",
                        minWidth: "18px",
                        height: "18px",
                        borderRadius: "999px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "600",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>

                {openNotif && (
                  <div
                    ref={notifRef}
                    style={{
                      position: "absolute",
                      top: "48px",
                      right: "0",
                      width: "300px",
                      maxHeight: "360px",
                      overflowY: "auto",
                      background: "#fff",
                      borderRadius: "14px",
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                      zIndex: 999,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        borderBottom: "1px solid #eee",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      <span>Notificaciones</span>
                      {pendingCount > 0 && (
                        <span
                          onClick={async (e) => {
                            e.stopPropagation();
                            const lista =
                              roles.admin || roles.superAdmin
                                ? notificacoes.filter(
                                    (n) => n.status === "PENDING",
                                  )
                                : notificacoes;

                            await Promise.all(
                              lista.map((n) =>
                                fetch(
                                  "https://axolove-deploy-1004.onrender.com/solicitacoes/visualizar",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: n.id }),
                                  },
                                ),
                              ),
                            );
                            fetchNotificacoes();
                          }}
                          style={{
                            fontSize: "11px",
                            color: "#2563eb",
                            cursor: "pointer",
                          }}
                        >
                          Marcar todo
                        </span>
                      )}
                    </div>

                    {notificacoes.length === 0 && (
                      <div
                        style={{
                          padding: "16px",
                          textAlign: "center",
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        Sin notificaciones
                      </div>
                    )}

                    {notificacoes.map((n) => (
                      <div
                        key={n.id}
                        style={{
                          padding: "10px 12px",
                          borderBottom: "1px solid #f1f1f1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          background:
                            n.status === "PENDING"
                              ? "rgba(59, 130, 246, 0.06)"
                              : "transparent",
                          transition: "0.2s",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#1f2937",
                            lineHeight: "1.4",
                            margin: 0,
                          }}
                        >
                          {n.status === "PENDING"
                            ? `Nueva solicitud de ${n.nome_usuario} para ser ${traduzirRole(n.role_desejada)} de la institución ${n.ens}`
                            : `Tu solicitud para ser ${traduzirRole(n.role_desejada)} de la institución ${n.ens} fue ${traduzirStatus(n.status)}`}
                        </p>

                        {(roles.admin || roles.superAdmin
                          ? n.status === "PENDING"
                          : true) && (
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                            }}
                          >
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                await fetch(
                                  "https://axolove-deploy-1004.onrender.com/solicitacoes/visualizar",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ id: n.id }),
                                  },
                                );
                                fetchNotificacoes();
                              }}
                              style={{
                                fontSize: "11px",
                                background: "transparent",
                                border: "none",
                                color: "#2563eb",
                                cursor: "pointer",
                                fontWeight: "500",
                              }}
                            >
                              Marcar como leído
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/*Perfil do usuário*/}
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className={`profile ${isLogged ? "connected" : "disconnected"}`}
                type="button"
                onClick={() => setIsProfileOpen((prev) => !prev)}
              >
                <div className="profile-identity-icon">
                  <div className="institution-icon">
                    <HiBuildingOffice2 size={16} />
                  </div>
                  <div className="user-badge-icon">
                    <HiUser size={10} />
                  </div>
                </div>
              </button>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  {!isLogged ? (
                    <div className="profile-empty">
                      <p className="profile-empty-title">
                        Ninguna cartera conectada
                      </p>
                      <p className="profile-empty-text">
                        Inicia sesión con MetaMask para ver los datos de tu
                        cuenta.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="profile-card-top">
                        <div className="profile-card-avatar">
                          <div className="institution-icon large">
                            <HiBuildingOffice2 size={18} />
                          </div>
                          <div className="user-badge-icon large">
                            <HiUser size={11} />
                          </div>
                        </div>

                        <div className="profile-card-main">
                          <p className="profile-card-name">
                            {ensName || "Dominio no identificado"}
                          </p>
                          <p className="profile-card-subtitle">{shortWallet}</p>
                        </div>
                      </div>

                      <div className="profile-section">
                        <span className="profile-label">Dominio</span>
                        <p className="profile-value">
                          {ensName || "Ningún dominio encontrado"}
                        </p>
                      </div>

                      <div className="profile-section">
                        <span className="profile-label">Cartera</span>
                        <p className="profile-value wallet-full">
                          {walletAddress}
                        </p>
                      </div>

                      <div className="profile-section">
                        <span className="profile-label">Roles</span>

                        {roleLabels.length > 0 ? (
                          <div className="roles-list">
                            {roleLabels.map((role) => (
                              <span key={role} className="role-badge">
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="profile-value">Sin roles asignados</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="hamburger-btn"
              onClick={() => setIsMobileOpen((prev) => !prev)}
            >
              {isMobileOpen ? <HiX /> : <HiMenu />}
            </button>
          </div>

          <div
            className={`mobile-overlay ${isMobileOpen ? "show" : ""}`}
            onClick={() => setIsMobileOpen(false)}
          />

          <nav className={`nav-mobile ${isMobileOpen ? "open" : ""}`}>
            <div className="nav-mobile-inner">
              <NavLink
                to="/"
                className={`nav-item mobile ${isHome ? "active" : ""}`}
                onClick={() => setIsMobileOpen(false)}
              >
                Inicio
              </NavLink>

              {!isWalletConnected && (
                <NavLink
                  to="/login"
                  className="nav-item mobile"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Conectar MetaMask
                </NavLink>
              )}

              {isLogged && roles.admin && (
                <NavLink
                  to="/painelAdmin"
                  className="nav-item mobile"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Admin
                </NavLink>
              )}

              {isLogged && roles.operator && (
                <NavLink
                  to="/painelOperador"
                  className="nav-item mobile"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Operador
                </NavLink>
              )}

              {isLogged && roles.validator && (
                <NavLink
                  to="/painelValidador"
                  className="nav-item mobile"
                  onClick={() => setIsMobileOpen(false)}
                >
                  Auditor
                </NavLink>
              )}

              {isLogged && roles.superAdmin && (
                <>
                  <NavLink
                    to="/superAdmin"
                    className="nav-item mobile"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Crear usuarios
                  </NavLink>

                  <NavLink
                    to="/criarInstituicao"
                    className="nav-item mobile"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Crear instituciones
                  </NavLink>
                </>
              )}

              {isLogged &&
                !roles.operator &&
                !roles.validator &&
                !roles.admin && (
                  <NavLink
                    to="/solicitarAcesso"
                    className="nav-item mobile"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    Solicitar acceso
                  </NavLink>
                )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
