//Hook para buscar axolotes do backend.
import { useState, useEffect } from "react";

export function useAxolotes() {
  const [axolotes, setAxolotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarAxolotes = async () => {
      try {
        const res = await fetch("http://localhost:3000/axolotes");
        if (!res.ok) throw new Error("Erro ao carregar axolotes");
        const data = await res.json();
        setAxolotes(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    carregarAxolotes();
  }, []);

  return { axolotes, loading };
}
