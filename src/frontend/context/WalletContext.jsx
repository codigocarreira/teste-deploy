import { createContext, useContext, useState, useEffect } from "react";
import { useWalletLogic } from "../hooks/useWallet";
import { ethers } from "ethers";
import { USER_ACCESS, USER_ACCESS_ABI } from "../src/config/contracts";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const wallet = useWalletLogic();
  const { walletAddress, signer } = wallet;

  const [user, setUser] = useState(null);

  const saveUser = (data) => {
    console.log("SET USER:", data);
    setUser(data);
  };

  const logout = () => {
    console.log("Logout");
    setUser(null);
  };

  useEffect(() => {
    if (!walletAddress) return;
    console.log("Wallet mudou. Portanto, resetando sessão");
    setUser(null);
  }, [walletAddress]);

  const getInstitutionENS = (ens) => {
    if (!ens) return null;

    const parts = ens.split(".");
    if (parts.length < 3) return ens;

    const institutionENS = parts.slice(1).join(".");
    console.log("ENS referente à instituição:", institutionENS);

    return institutionENS;
  };

  //Sincronização com o banco.
  useEffect(() => {
    const sync = async () => {
      if (!user?.ens || user?.blockchainInstitutionId === undefined) {
        console.log("Aguardando dados para sincronização...");
        return;
      }

      try {
        const institutionENS = getInstitutionENS(user.ens);

        console.log("Sincronizando instituição...");
        console.log("ENS enviado:", institutionENS);
        console.log("ID da instituição na blockchain:", user.blockchainInstitutionId);

        const res = await fetch("http://localhost:3000/instituicoes/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ens: institutionENS,
            blockchainInstitutionId: user.blockchainInstitutionId
          })
        });

        const text = await res.text();
        console.log("RAW RESPONSE:", text);

        const data = JSON.parse(text);

        console.log("Sync OK:", data);

        setUser((prev) => ({
          ...prev,
          institutionId: data.dbId,
          blockchainInstitutionId: prev.blockchainInstitutionId
        }));

      } catch (err) {
        console.error("Erro de sincronização:", err);
      }
    };

    sync();
  }, [user?.ens, user?.blockchainInstitutionId]);


  useEffect(() => {
    const fetchRoles = async () => {
      if (!walletAddress || !signer || user?.blockchainInstitutionId === undefined) {
        console.log("Sem blockchainInstitutionId ainda...");
        return;
      }

      try {
        console.log("Buscando roles on-chain...");

        const contract = new ethers.Contract(
          USER_ACCESS,
          USER_ACCESS_ABI,
          signer
        );

        const instId = user.blockchainInstitutionId;

        const [isAdmin, isOperator, isValidator, superAdminRole] = await Promise.all([
          contract.isInstitutionAdmin(instId, walletAddress),
          contract.isInstitutionOperator(instId, walletAddress),
          contract.isInstitutionValidator(instId, walletAddress),
          contract.hasRole(await contract.PLATFORM_ADMIN_ROLE(), walletAddress)
          
        ]);

        console.log("Roles:", {
          isAdmin,
          isOperator,
          isValidator,
          superAdminRole
        });

        setUser((prev) => ({
          ...prev,
          wallet: walletAddress,
          roles: {
            admin: isAdmin,
            operator: isOperator,
            validator: isValidator,
            superAdmin: superAdminRole
          }
        }));

      } catch (err) {
        console.error("Erro ao buscar roles:", err);
      }
    };

    fetchRoles();
  }, [walletAddress, signer, user?.blockchainInstitutionId]);

  return (
    <WalletContext.Provider
      value={{
        ...wallet,
        user,
        setUser: saveUser,
        logout
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}