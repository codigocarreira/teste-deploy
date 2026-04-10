//Importando express e router.
const express = require("express");
const router = express.Router();

//Importando o controller de exportacao.
const exportController = require("../controllers/exportController");

//Rota para exportar dados como Excel.
router.get("/excel", exportController.exportarExcel);

module.exports = router;
