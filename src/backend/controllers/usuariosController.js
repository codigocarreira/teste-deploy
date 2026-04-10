const { criarOperador, ativarOperador } = require("../models/operadorModel");
const { criarAuditor, ativarAuditor } = require("../models/auditorModel");
const { obterAdminPorWallet } = require("../models/adminModel");

const registrarUsuario = async (req, res) => {
  try {
    const { name, wallet, role, adminWallet, institutionId } = req.body;

    if (!name || !wallet || !role || !adminWallet || !institutionId) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const admin = await obterAdminPorWallet(adminWallet);

    if (!admin) {
      return res.status(400).json({ error: "Admin não encontrado" });
    }

    let user;

    if (role === "OPERATOR") {
      user = await criarOperador({
        nome: name,
        carteira_metamask: wallet,
        fk_administrador_id: admin.id,
        fk_instituicao_id: institutionId
      });
    }

    else if (role === "VALIDATOR") {
      user = await criarAuditor({
        nome: name,
        carteira_metamask: wallet,
        fk_administrador_id: admin.id,
        fk_instituicao_id: institutionId
      });
    }

    else {
      return res.status(400).json({ error: "Role inválida" });
    }

    return res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
};

const ativarUsuario = async (req, res) => {
  try {
    const { wallet, role } = req.body;

    if (role === "OPERATOR") {
      await ativarOperador(wallet);
    } else {
      await ativarAuditor(wallet);
    }

    return res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "Erro ao ativar usuário" });
  }
};

module.exports = {
  registrarUsuario,
  ativarUsuario
};