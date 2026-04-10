import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWalletLogic() {
  const [walletAddress, setWalletAddress] = useState("");
  const [status, setStatus] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("Instale o MetaMask!");

      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();

      setWalletAddress(accounts[0]);
      setProvider(_provider);
      setSigner(_signer);

      setStatus("Carteira conectada: " + accounts[0]);

      console.log("[DEBUG] Carteira conectada:", accounts[0]);
    } catch (err) {
      console.error("[DEBUG] Erro connectWallet:", err);
      setStatus(err.message || "Erro ao conectar carteira");
    }
  };


  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts) => {
      console.log("[DEBUG] Conta trocada:", accounts);

      if (accounts.length === 0) {
        setWalletAddress("");
        setSigner(null);
        setProvider(null);
        return;
      }

      setWalletAddress(accounts[0]);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);


  const ensResolvesToWallet = async (ensName) => {
    if (!provider || !walletAddress) return false;

    try {
      const resolver = await provider.getResolver(ensName);

      if (!resolver) return false;
      
      const resolvedAddress = await resolver.getAddress();
      console.log("[DEBUG] ENS", ensName, "→", resolvedAddress);

      if (!resolvedAddress) return false;

      return (
        resolvedAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    } catch (err) {
      console.error("[DEBUG] Erro ENS:", err);
      return false;
    }
  };

  return {
    walletAddress,
    provider,
    signer,
    status,
    connectWallet,
    ensResolvesToWallet
  };
}