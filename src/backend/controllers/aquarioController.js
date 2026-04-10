const aquarioModel = require("../models/aquarioModel");
const operadorModel = require("../models/operadorModel");
const adminModel = require("../models/adminModel");
const { uploadToIPFS } = require("../services/ipfsService");

//Listando os aquários.
const listarAquarios = async (req, res) => {
  try {
    const aquarios = await aquarioModel.obterAquarios();
    res.json(aquarios);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

//Obtendo um aquario por id.
const obterUmAquarioPorId = async (req, res) => {
  try {
    const aquario = await aquarioModel.obterAquarioPorId(req.params.id);
    if (!aquario)
      return res.status(404).json({ erro: "Aquario nao encontrado" });
    res.json(aquario);
  } catch (err) {
    console.error("Erro ao buscar aquario:", err);
    res.status(500).json({ erro: "Erro ao buscar aquario" });
  }
};

//Criando os aquários.
const criarAquario = async (req, res) => {
  try {
    const { operador_wallet, fk_instituicao_id } = req.body;
    const instituicaoId = Number(fk_instituicao_id);

    if (!operador_wallet) {
      return res.status(400).json({
        erro: "Wallet do operador é obrigatória",
      });
    }

    if (!instituicaoId) {
      return res.status(400).json({
        erro: "ID da instituição é obrigatório",
      });
    }

    console.log("Wallet usada:", operador_wallet);
    console.log("Instituição recebida:", fk_instituicao_id);
    console.log("Instituição convertida:", instituicaoId);

    const operador =
      await operadorModel.obterOperadorPorWallet(operador_wallet);

    if (!operador) {
      return res.status(404).json({
        erro: "Operador não encontrado",
      });
    }

    const imagem_url = req.file ? req.file.path : null;

    const aquario = await aquarioModel.criarAquario({
      ...req.body,
      imagem_url,
      fk_operador_id: operador.id,
      fk_instituicao_id: instituicaoId,
    });

    const dadosIpfs = {
      tipo: "cadastro_aquario",
      aquarioId: aquario.id,
      codigo_tanque: aquario.codigo_tanque,
      localizacao: aquario.localizacao,
      operador: operador.id,
      instituicao: instituicaoId,
      timestamp: new Date().toISOString(),
    };

    const cid = await uploadToIPFS(dadosIpfs, `aquario_${aquario.id}`);

    res.status(201).json({ aquario, cid });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({
        erro: `Já existe um aquário com esse código de tanque (${error.detail || ""}).`,
      });
    }
    res.status(500).json({ erro: "Erro ao criar aquário" });
  }
};
//Salvando dados on-chain de um aquario.
const salvarOnchainAquario = async (req, res) => {
  try {
    const { id } = req.params;
    const { cidIpfs, onchainEntityId, txHash } = req.body;

    if (!cidIpfs || !onchainEntityId || !txHash) {
      return res.status(400).json({
        erro: "cidIpfs, onchainEntityId e txHash são obrigatórios",
      });
    }

    const aquario = await aquarioModel.salvarOnchainAquario(
      id,
      cidIpfs,
      onchainEntityId,
      txHash,
    );
    if (!aquario)
      return res.status(404).json({ erro: "Aquario nao encontrado" });
    res.json(aquario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar dados on-chain" });
  }
};

//Exportando as funções.
module.exports = {
  criarAquario,
  listarAquarios,
  obterUmAquarioPorId,
  salvarOnchainAquario,
};
