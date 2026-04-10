const instituicaoModel = require("../models/instituicaoModel");

const { criarDominio, obterTodosDominios } = instituicaoModel;

const syncInstituicao = async (req, res) => {
  try {
    const { ens, blockchainInstitutionId } = req.body;
    console.log("[SYNC] Dados recebidos:", {ens, blockchainInstitutionId});

    if (!ens || blockchainInstitutionId === undefined) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const inst = await instituicaoModel.criarOuObterInstituicao({
      nome: ens,
      dominio: ens,
      blockchain_id: blockchainInstitutionId
    });

    console.log("[SYNC] Resultado:", inst);

    res.json({
      dbId: inst.id,
      blockchainId: inst.blockchain_id,
      ens: inst.dominio
    });

  } catch (err) {
    console.error("Erro syncInstituicao:", err);
    res.status(500).json({ error: "Erro ao sincronizar instituição" });
  }
};


const criarInstituicao = async (req, res) => {
  try {
    const { nome, dominio, blockchain_id } = req.body;

    if (!nome || !dominio || blockchain_id == undefined) {
      return res.status(400).json({ error: "Dados incompletos" });
    }

    const blockchainIdInt = Number(blockchain_id);

    if (isNaN(blockchainIdInt)) {
      return res.status(400).json({ error: "blockchain_id inválido" });
    }

    const inst = await criarDominio({ nome, dominio, blockchain_id: blockchainIdInt });

    return res.json(inst);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao criar instituição" });
  }
};

const listarInstituicoes = async (req, res) => {
  try {
    const insts = await obterTodosDominios();
    return res.json(insts);
  } catch (err) {
    return res.status(500).json({ error: "Erro ao buscar instituições" });
  }
};

module.exports = {
  syncInstituicao,
  criarInstituicao,
  listarInstituicoes
};