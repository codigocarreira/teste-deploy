const express = require("express");
const authController = require("../controllers/authController")
const router = express.Router();

router.get("/nonce", authController.getNonce);
router.post("/login-ens", authController.loginENS);

console.log("As rotas de login ENS existem e rodaram.")
module.exports = router;