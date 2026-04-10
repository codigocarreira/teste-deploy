//Controller de exportacao de dados.
const { buildExcel } = require("../services/excelExportService");

//Exportando dados como arquivo Excel (.xlsx).
const exportarExcel = async (req, res) => {
  try {
    const workbook = await buildExcel();

    //Configurando headers para download de arquivo .xlsx.
    const timestamp = new Date().toISOString().split("T")[0];
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=axolodao_export_${timestamp}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Erro ao exportar Excel:", error);
    res.status(500).json({ erro: "Erro ao gerar arquivo de exportação" });
  }
};

//Exportando as funcoes.
module.exports = { exportarExcel };
