const solicitacaoModel = require("../models/solicitacaoRoleModel");
const instituicaoModel = require("../models/instituicaoModel");

const { criarOperador, ativarOperador } = require("../models/operadorModel");
const { criarAuditor, ativarAuditor } = require("../models/auditorModel");
const { criarAdmin } = require("../models/adminModel");

const criarSolicitacao = async (req, res) => {
  try {
    const { name, wallet, role, blockchainInstitutionId, ens } = req.body;
    if (!name || !wallet || !role || blockchainInstitutionId === undefined) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const instituicao = await instituicaoModel.criarOuObterInstituicao({
      nome: ens,
      dominio: ens,
      blockchain_id: blockchainInstitutionId
    });

    const solicitacao = await solicitacaoModel.criarSolicitacao({
      nome: name,
      carteira: wallet,
      ens,
      role,
      fk_instituicao_id: instituicao.id,
      blockchain_institution_id: blockchainInstitutionId
    });

    res.json(solicitacao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar solicitação" });
  }
};

const listarSolicitacoes = async (req, res) => {
  try {
    const { institutionId, status, roles } = req.query;
    if (!institutionId) return res.status(400).json({ error: "institutionId é obrigatório" });

    const roleFilter = roles ? roles.split(",") : undefined;

    const lista = await solicitacaoModel.obterSolicitacoesPorInstituicao(
      institutionId,
      status,
      roleFilter
    );

    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar" });
  }
};

const aprovarSolicitacao = async (req, res) => {
  try {
    const { solicitacaoId } = req.body;
    const sol = await solicitacaoModel.obterSolicitacaoPorId(solicitacaoId);
    if (!sol) return res.status(404).json({ error: "Não encontrada" });

    if (sol.role_desejada === "ADMIN") {
      await criarAdmin({
        nome: sol.nome_usuario,
        carteira_metamask: sol.carteira_metamask,
        fk_instituicao_id: sol.fk_instituicao_id
      });
    } else if (sol.role_desejada === "OPERATOR") {
      await criarOperador({
        nome: sol.nome_usuario,
        carteira_metamask: sol.carteira_metamask,
        fk_administrador_id: null,
        fk_instituicao_id: sol.fk_instituicao_id
      });
      await ativarOperador(sol.carteira_metamask);
    } else if (sol.role_desejada === "VALIDATOR") {
      await criarAuditor({
        nome: sol.nome_usuario,
        carteira_metamask: sol.carteira_metamask,
        fk_administrador_id: null,
        fk_instituicao_id: sol.fk_instituicao_id
      });
      await ativarAuditor(sol.carteira_metamask);
    }

    await solicitacaoModel.atualizarStatusSolicitacao(solicitacaoId, "APPROVED");
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao aprovar" });
  }
};

const rejeitarSolicitacao = async (req, res) => {
  try {
    const { solicitacaoId } = req.body;
    await solicitacaoModel.atualizarStatusSolicitacao(solicitacaoId, "REJECTED");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao rejeitar" });
  }
};

const obterNotificacoes = async (req, res) => {
  try {
    const { institutionId, wallet, superAdminRole } = req.query;
    console.log("===== DEBUG NOTIFICAÇÕES =====");
    console.log("Query params recebidos:", req.query);

    let notificacoes = [];

    if (superAdminRole === "true") {
      console.log("Buscando notificações de SuperAdmin...");
      notificacoes = await solicitacaoModel.obterNotificacoesSuperAdmin();
    } else if (institutionId) {
      console.log(`Buscando notificações de Admin da instituição: ${institutionId}`);
      notificacoes = await solicitacaoModel.obterNotificacoesAdmin(institutionId);
    } else if (wallet) {
      console.log(`Buscando notificações de usuário: ${wallet}`);
      notificacoes = await solicitacaoModel.obterNotificacoesUsuario(wallet);
    }

    console.log("Notificações retornadas do DB:", notificacoes);
    res.json(notificacoes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
};

const visualizarNotificacao = async (req, res) => {
  try {
    const { id } = req.body;
    await solicitacaoModel.marcarComoVisto(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao marcar como visto" });
  }
};

module.exports = {
  criarSolicitacao,
  listarSolicitacoes,
  aprovarSolicitacao,
  rejeitarSolicitacao,
  obterNotificacoes,
  visualizarNotificacao
};