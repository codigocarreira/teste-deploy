const express = require("express");
const usuariosController = require("../controllers/usuariosController");

const router = express.Router();

router.post("/register", usuariosController.registrarUsuario);
router.post("/activate", usuariosController.ativarUsuario);

module.exports = router;