import React, { useState } from "react";
import "./styles.css";

function BotaoExportarExcel() {
  const [loading, setLoading] = useState(false);

  const baixarExcel = async () => {
    try {
      setLoading(true);

      const response = await fetch("https://axolove-deploy-1004.onrender.com/export/excel", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Erro ao exportar arquivo");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "axolodao_export.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar Excel:", error);
      alert("No fue posible exportar el archivo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="botao-exportar" onClick={baixarExcel} disabled={loading}>
      {loading ? "Descargando..." : "Descargar Excel"}
    </button>
  );
}

export default BotaoExportarExcel;
