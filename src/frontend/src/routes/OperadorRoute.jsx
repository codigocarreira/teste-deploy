import { Navigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext.jsx";

export default function OperadorRoute({ children }) {
  const { user, walletAddress } = useWallet();

  console.log("DEBUG: user raw:", user);

  if (!walletAddress) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <div>Carregando...</div>;
  }

  const rolesObj = user.roles || {};
  console.log("DEBUG: roles object:", rolesObj);
  const hasOperatorRole = rolesObj.operator === true;
  console.log("DEBUG: hasOperatorRole =", hasOperatorRole);

  if (!hasOperatorRole) {
    console.log("DEBUG: Acesso negado, redirecionando");
    return <Navigate to="/acessoDenegado" />;
  }

  console.log("DEBUG: Acesso permitido");

  return children;
}