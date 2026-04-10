const express = require("express");
const instituicaoController = require("../controllers/instituicaoController")
const router = express.Router();

router.post("/sync", instituicaoController.syncInstituicao);
router.post("/", instituicaoController.criarInstituicao);
router.get("/", instituicaoController.listarInstituicoes);

module.exports = router;