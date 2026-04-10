//Importando express e router.
const express = require("express");
const router = express.Router();

//Importndo o controller do axolote.
const axoloteController = require("../controllers/axoloteController");

//Middleware para upload de imagens dos axolotes ao Cloudinary.
const uploadImagensAxolotes = require("../middlewares/uploadImagensAxolotes");

//Rota para criar o axolote (mandando a imagem dele para o Cloudinary).
router.post("/", uploadImagensAxolotes.single("imagem"),axoloteController.criarAxolote);

//Rota para obter axolotes.
router.get("/", axoloteController.listarAxolotes);

//Rota para obter um axolote por id.
router.get("/:id", axoloteController.obterUmAxolotePorId);

//Rota para salvar dados on-chain de um axolote.
router.patch("/:id/onchain", axoloteController.salvarOnchainAxolote);

//Exportando a rota para ser usada no server.js
module.exports = router;
