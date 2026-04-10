const express = require("express");
const solicitacaoController = require("../controllers/solicitacaoController");

const router = express.Router();

router.post("/", solicitacaoController.criarSolicitacao);
router.get("/", solicitacaoController.listarSolicitacoes);
router.post("/aprovar", solicitacaoController.aprovarSolicitacao);
router.post("/rejeitar", solicitacaoController.rejeitarSolicitacao);
router.get("/notificacoes", solicitacaoController.obterNotificacoes);
router.post("/visualizar", solicitacaoController.visualizarNotificacao);

module.exports = router;