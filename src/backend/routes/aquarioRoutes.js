const express = require("express");
const router = express.Router();

//Importando o controller do aquário.
const aquarioController = require("../controllers/aquarioController");

//Middleware para upload de imagens dos aquários ao Cloudinary.
const uploadImagensAquarios = require("../middlewares/uploadImagensAquarios");

//Rota para listar aquários.
router.get("/", aquarioController.listarAquarios);

//Rota para buscar aquario por id.
router.get("/:id", aquarioController.obterUmAquarioPorId);

//Rota para criar aquário (já com a imagem sendo enviada ao Cloudinary).
router.post("/", uploadImagensAquarios.single("imagem"), aquarioController.criarAquario);

//Rota para salvar dados on-chain de um aquario.
router.patch("/:id/onchain", aquarioController.salvarOnchainAquario);

module.exports = router;
