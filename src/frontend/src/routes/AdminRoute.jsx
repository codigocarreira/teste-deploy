import { Navigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext.jsx";

export default function AdminRoute({ children }) {
  const { user } = useWallet();

  console.log("DEBUG: user raw:", user);

  if (!user) {
    return <div>Carregando...</div>; // ou spinner
  }
  
  const rolesObj = user.roles || {};
  console.log("DEBUG: roles object:", rolesObj);

  const hasAdminRole = rolesObj.admin === true;
  console.log("DEBUG: hasAdminRole =", hasAdminRole);

  if (!hasAdminRole) {
    console.log("DEBUG: Acesso negado, redirecionando");
    return <Navigate to="/acessoDenegado" />;
  }

  console.log("DEBUG: Acesso permitido");
  return children;
}