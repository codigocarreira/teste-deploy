//Importando o model do axolote e do operador.
const axoloteModel = require("../models/axoloteModel");
const operadorModel = require("../models/operadorModel");
const { uploadToIPFS } = require("../services/ipfsService");

//Listando os aquários.
const listarAxolotes = async (req, res) => {
  try {
    const axolotes = await axoloteModel.obterAxolotes();
    res.json(axolotes);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

//Requisição para criar axolote.
const criarAxolote = async (req, res) => {
  try {
    const { operador_wallet, fk_instituicao_id } = req.body;
    const instituicaoId = Number(fk_instituicao_id);

    console.log("Wallet usada: ", operador_wallet);
    console.log("Instituição recebida: ", fk_instituicao_id);
    console.log("Instituição convertida: ", instituicaoId);

    if (!instituicaoId) {
      return res.status(400).json({
        erro: "ID da instituição é obrigatório",
      });
    }
    const operador =
      await operadorModel.obterOperadorPorWallet(operador_wallet);
    console.log("Operador encontrado: ", operador);

    if (!operador) {
      return res.status(404).json({
        erro: "Operador não encontrado",
      });
    }

    // Validar se o operador pertence à instituição
    //if (Number(operador.fk_instituicao_id) !== instituicaoId) {
    //  return res.status(403).json({
    //    erro: "Operador não tem permissão para criar axolotes nesta instituição",
    //  });
    //}

    const imagem_url = req.file ? req.file.path : null;

    const axolote = await axoloteModel.criarAxolote({
      ...req.body,
      imagem_url,
      fk_operador_id: operador.id,
      fk_instituicao_id: instituicaoId,
    });
    //Subindo dados do axolote pro IPFS.
    const dadosIpfs = {
      tipo: "cadastro_axolote",
      axoloteId: axolote.id,
      nome_cientifico: axolote.nome_cientifico,
      especie_apelido: axolote.especie_apelido,
      cod_exemplar: axolote.cod_exemplar,
      operador: operador.id,
      instituicao: instituicaoId,
      cor: axolote.cor,
      sexo: axolote.sexo,
      timestamp: new Date().toISOString(),
    };
    const cid = await uploadToIPFS(dadosIpfs, `axolote_${axolote.id}`);

    res.status(201).json({ axolote, cid });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(409).json({
        erro: `Já existe um axolote com esse código de exemplar (${error.detail || ""}).`,
      });
    }
    res.status(500).json({ erro: "Erro ao criar axolote" });
  }
};

const obterUmAxolotePorId = async (req, res) => {
  try {
    const axolote = await axoloteModel.obterAxolotePorId(req.params.id);
    if (!axolote) {
      return res.status(404).json({ error: "Axolote não encontrado" });
    }
    res.status(200).json(axolote);
  } catch (error) {
    console.error("Erro ao buscar axolote:", error);
    res.status(500).json({ error: "Erro ao buscar axolote" });
  }
};

//Salvando dados on-chain de um axolote.
const salvarOnchainAxolote = async (req, res) => {
  try {
    const { id } = req.params;
    const { cidIpfs, onchainEntityId, txHash } = req.body;

    if (!cidIpfs || !onchainEntityId || !txHash) {
      return res.status(400).json({
        erro: "cidIpfs, onchainEntityId e txHash são obrigatórios",
      });
    }

    const axolote = await axoloteModel.salvarOnchainAxolote(
      id,
      cidIpfs,
      onchainEntityId,
      txHash,
    );

    if (!axolote) {
      return res.status(404).json({ erro: "Axolote nao encontrado" });
    }

    res.json(axolote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar dados on-chain" });
  }
};

module.exports = {
  criarAxolote,
  listarAxolotes,
  obterUmAxolotePorId,
  salvarOnchainAxolote,
};
