import { useState, useEffect } from "react";

export function useAquarios() {
  const [aquarios, setAquarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarAquarios = async () => {
      try {
        const res = await fetch("https://axolove-deploy-1004.onrender.com/aquarios");
        if (!res.ok) throw new Error("Erro ao carregar aquários");
        const data = await res.json();
        setAquarios(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregarAquarios();
  }, []);

  return { aquarios, loading };
}