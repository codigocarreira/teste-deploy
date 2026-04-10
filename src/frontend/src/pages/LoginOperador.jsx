import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logoAxolove from "../assets/logo_axolove.png";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";

//Função para o operador logar.
export default function Login() {
  //Obtendo os dados do operador.
  const { userAddress, roles, connectWallet } = useWallet();

  //Importando a função de navegação entre telas.
  const navigate = useNavigate();

  //useState para mostrar o processo de carregando conexão com a carteira.
  const [loading, setLoading] = useState(false);

  //Iniciando a conexão com a carteira MetaMask.
  const handleConnect = async () => {
    Swal.fire({
      title: "Conectando billetera...",
      text: "Verificando permisos...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    setLoading(true);
    await connectWallet();
    setLoading(false);
  };

  useEffect(() => {
    if (!userAddress) return;

    //O painel do operador só aparece depois que ele estiver logado com a carteira.
    if (roles.operator === true) {
      Swal.close();
      navigate("/painelOperador");
    }
    if (roles.operator === false) {
      Swal.close();
    }
  }, [userAddress, roles.operator, navigate]);

  const shortAddress = (addr) => addr.slice(0, 6) + "..." + addr.slice(-4);

  //Enquanto a carteira não estiver conectada, aparece um container mostrando um botão para conexão.
  if (!userAddress) {
    return (
      <section>
        <Header />
        <div className="login-container">
          <div className="login-card">
            <img src={logoAxolove} alt="Axolove" className="logo" />
            <h2>Sign in to Axolove</h2>
            <p>¡Bienvenido de nuevo! Inicia sesión para continuar.</p>
            <button className="metamask-btn" onClick={handleConnect}>
              Conectar Metamask
            </button>
          </div>
        </div>
      </section>
    );
  }

  //Verificando permissões.
  if (loading || roles.operator === undefined) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Billetera conectada</h2>
          <p>{shortAddress(userAddress)}</p>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  //A mensagem de "não operador" só é renderizada se roles.operador estiver definido como false.
  if (roles.operator === false) {
    return (
      <section>
        <Header />
        <div className="login-container">
          <div className="login-card">
            <h2>Billetera conectada</h2>
            <p>{shortAddress(userAddress)}</p>
            <p>No tienes permiso de operador.</p>
          </div>
        </div>
      </section>
    );
  }

  //Se for operador, o useEffect já redirecionou, então não precisa renderizar nada.
  return null;
}
