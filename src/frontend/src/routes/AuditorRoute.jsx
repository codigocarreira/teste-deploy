import { Navigate } from "react-router-dom";
import { useWallet } from "../../context/WalletContext.jsx";

export default function AuditorRoute({ children }) {
  const { user } = useWallet();
  if (!user) {
    return <div>Carregando...</div>;
  }

  const roles = Array.isArray(user?.roles) ? user.roles : [user?.roles].filter(Boolean);

  const hasValidatorRole = roles.some(role => role.toUpperCase() === "VALIDATOR");

  if (!hasValidatorRole) {
    return <Navigate to="/acessoDenegado" />;
  }

  return children;
}