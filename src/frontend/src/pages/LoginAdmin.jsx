import { useEffect, useState } from "react";
import { useWallet } from "../../context/WalletContext.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logoAxolove from "../assets/logo_axolove.png";
import Swal from "sweetalert2";
import Header from "../components/layout/Header";

//Função para o admin logar.
export default function Login() {

  //Obtendo os dados do admin.
  const { userAddress, roles, connectWallet } = useWallet();

  //Importando a função de navegação entre telas.
  const navigate = useNavigate();

  //useState para mostrar o processo de carregando conexão com a carteira.
  const [loading, setLoading] = useState(false);

  //Iniciando a conexão com a carteira MetaMask.
  const handleConnect = async () => {
    Swal.fire({
      title: "Conectando carteira...",
      text: "Verificando permissões...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setLoading(true);
    await connectWallet();
    setLoading(false);
  };

  useEffect(() => {
    if (!userAddress) return;

    //O painel para o admin inserir novos usuários só abre depois que ele estiver logado.
    if (roles.admin === true) {
      Swal.close();
      navigate("/painelAdmin");
    }
    if (roles.admin === false) {
      Swal.close();
    }

  }, [userAddress, roles.admin, navigate]);

  const shortAddress = (addr) =>
    addr.slice(0,6) + "..." + addr.slice(-4);

  //Enquanto a carteira não estiver conectada, aparece um container mostrando um botão para conexão.
  if (!userAddress) {
    return (
      <section>
        <Header/>
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
  if (loading || roles.admin === undefined) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Carteira conectada</h2>
          <p>{shortAddress(userAddress)}</p>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  //A mensagem de "não admin" só é renderizada se roles.admin estiver definido como false.
  if (roles.admin === false) {
    return (
      <section>
        <Header/>
        <div className="login-container">
        <div className="login-card">
          <h2>Carteira conectada</h2>
          <p>{shortAddress(userAddress)}</p>
          <p>Você não possui permissão de Admin.</p>
        </div>
      </div>
      </section>
      
    );
  }

  //Se for admin, o useEffect já redirecionou, então não precisa renderizar nada.
  return null;
}