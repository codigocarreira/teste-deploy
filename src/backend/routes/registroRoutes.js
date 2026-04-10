//Importando express e router.
const express = require("express");
const router = express.Router();

//Importando o controller dos registros.
const registroController = require("../controllers/registroController");

//Rotas de registro de axolote.
router.post("/axolote", registroController.criarRegistroAxolote);
router.get("/axolote", registroController.listarRegistrosAxolote);
router.patch("/axolote/:id/status", registroController.atualizarStatusAxolote);
router.patch("/axolote/:id/onchain", registroController.salvarOnchainAxolote);
router.get("/axolote/:id/pesoVsTamanho", registroController.obterPesoTamanhoAxolote);

//Rotas de registro de aquario.
router.post("/aquario", registroController.criarRegistroAquario);
router.get("/aquario", registroController.listarRegistrosAquario);
router.patch("/aquario/:id/status", registroController.atualizarStatusAquario);
router.patch("/aquario/:id/onchain", registroController.salvarOnchainAquario);
router.get("/aquario/:id/temperaturaEph", registroController.obterTempPHAquario);
router.get("/axolote/:id/resumo", registroController.obterResumoAxolote);

//Rota para subir parecer de auditoria pro IPFS.
router.post("/auditoria", registroController.criarRegistroAuditoria);

//Exportando a rota para o server.js
module.exports = router;
