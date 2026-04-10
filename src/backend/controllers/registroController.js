//Importando models e servico IPFS.
const registroAxoloteModel = require("../models/registroAxoloteModel");
const registroAquarioModel = require("../models/registroAquarioModel");
const operadorModel = require("../models/operadorModel");
const auditorModel = require("../models/auditorModel");
const { uploadToIPFS, getFromIPFS } = require("../services/ipfsService");

//Criando registro de axolote (recebe JSON, sobe IPFS, salva CID).
const criarRegistroAxolote = async (req, res) => {
  try {
    const { axoloteId, operadorId, dados, dataMedicao } = req.body;

    //Resolvendo wallet address para ID do operador.
    let opId = operadorId;
    if (typeof operadorId === "string" && operadorId.startsWith("0x")) {
      const operador = await operadorModel.obterOperadorPorWallet(operadorId);
      if (!operador)
        return res
          .status(404)
          .json({ erro: "Operador nao encontrado para essa wallet" });
      opId = operador.id;
    }

    const cid = await uploadToIPFS(dados, `registro_axolote_${axoloteId}`);
    const registro = await registroAxoloteModel.criarRegistroAxolote({
      fk_axolote_id: axoloteId,
      fk_operador_id: opId,
      cid_ipfs: cid,
      data_ultima_medicao: dataMedicao || null,
    });
    res.status(201).json({ registro, cid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar registro de axolote" });
  }
};

//Criando registro de aquario (recebe JSON, sobe IPFS, salva CID).
const criarRegistroAquario = async (req, res) => {
  try {
    const { aquarioId, operadorId, dados, dataMedicao } = req.body;

    //Resolvendo wallet address para ID do operador.
    let opId = operadorId;
    if (typeof operadorId === "string" && operadorId.startsWith("0x")) {
      const operador = await operadorModel.obterOperadorPorWallet(operadorId);
      if (!operador)
        return res
          .status(404)
          .json({ erro: "Operador nao encontrado para essa wallet" });
      opId = operador.id;
    }

    const cid = await uploadToIPFS(dados, `registro_aquario_${aquarioId}`);
    const registro = await registroAquarioModel.criarRegistroAquario({
      fk_aquario_id: aquarioId,
      fk_operador_id: opId,
      cid_ipfs: cid,
      data_ultima_medicao: dataMedicao || null,
    });
    res.status(201).json({ registro, cid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar registro de aquario" });
  }
};

//Listando registros de axolote.
const listarRegistrosAxolote = async (req, res) => {
  try {
    const registros = await registroAxoloteModel.obterTodosRegistrosAxolote();
    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar registros de axolote" });
  }
};

//Listando registros de aquario.
const listarRegistrosAquario = async (req, res) => {
  try {
    const registros = await registroAquarioModel.obterTodosRegistrosAquario();
    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar registros de aquario" });
  }
};

//Atualizando status de auditoria de um registro de axolote.
const atualizarStatusAxolote = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, auditorId, cidAuditoria } = req.body;

    //Resolvendo wallet address para ID do auditor.
    let audId = auditorId;
    if (typeof auditorId === "string" && auditorId.startsWith("0x")) {
      const auditor = await auditorModel.obterAuditorPorWallet(auditorId);
      if (!auditor)
        return res
          .status(404)
          .json({ erro: "Auditor nao encontrado para essa wallet" });
      audId = auditor.id;
    }

    const registro = await registroAxoloteModel.atualizarStatusRegistroAxolote(
      id,
      status,
      audId,
      cidAuditoria || null,
    );
    if (!registro)
      return res.status(404).json({ erro: "Registro nao encontrado" });
    res.json(registro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar status do registro" });
  }
};

//Atualizando status de auditoria de um registro de aquario.
const atualizarStatusAquario = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, auditorId, cidAuditoria } = req.body;

    //Resolvendo wallet address para ID do auditor.
    let audId = auditorId;
    if (typeof auditorId === "string" && auditorId.startsWith("0x")) {
      const auditor = await auditorModel.obterAuditorPorWallet(auditorId);
      if (!auditor)
        return res
          .status(404)
          .json({ erro: "Auditor nao encontrado para essa wallet" });
      audId = auditor.id;
    }

    const registro = await registroAquarioModel.atualizarStatusRegistroAquario(
      id,
      status,
      audId,
      cidAuditoria || null,
    );
    if (!registro)
      return res.status(404).json({ erro: "Registro nao encontrado" });
    res.json(registro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar status do registro" });
  }
};

//Salvando IDs on-chain de um registro de axolote.
const salvarOnchainAxolote = async (req, res) => {
  try {
    const { id } = req.params;
    const { onchainEntityId, onchainRecordId, txHash } = req.body;

    if (!onchainEntityId || !onchainRecordId || !txHash) {
      return res.status(400).json({
        erro: "onchainEntityId, onchainRecordId e txHash são obrigatórios",
      });
    }

    const registro = await registroAxoloteModel.salvarOnchainIdsAxolote(
      id,
      onchainEntityId,
      onchainRecordId,
      txHash,
    );
    if (!registro)
      return res.status(404).json({ erro: "Registro nao encontrado" });
    res.json(registro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar IDs on-chain" });
  }
};

//Salvando IDs on-chain de um registro de aquario.
const salvarOnchainAquario = async (req, res) => {
  try {
    const { id } = req.params;
    const { onchainEntityId, onchainRecordId, txHash } = req.body;

    if (!onchainEntityId || !onchainRecordId || !txHash) {
      return res.status(400).json({
        erro: "onchainEntityId, onchainRecordId e txHash são obrigatórios",
      });
    }

    const registro = await registroAquarioModel.salvarOnchainIdsAquario(
      id,
      onchainEntityId,
      onchainRecordId,
      txHash,
    );
    if (!registro)
      return res.status(404).json({ erro: "Registro nao encontrado" });
    res.json(registro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao salvar IDs on-chain" });
  }
};

//Subindo JSON de auditoria pro IPFS e retornando o CID.
const criarRegistroAuditoria = async (req, res) => {
  try {
    const { registroId, tipo, dados } = req.body;
    const cid = await uploadToIPFS(dados, `auditoria_${tipo}_${registroId}`);
    res.status(201).json({ cid });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ erro: "Erro ao criar registro de auditoria no IPFS" });
  }
};

const obterDadosIPFSAxolote = async (req, res) => {
  try {
    const { id } = req.params;

    //Buscando dados de registro.
    const registros = await registroAxoloteModel.obterRegistrosPorAxolote(id);

    const dados = await Promise.all(
      registros.map(async (r) => {
        try {
          const json = await getFromIPFS(r.cid_ipfs);
          console.log(r.cid_ipfs);
          console.log(json);
        } catch (err) {
          console.error("Erro ao obter o CID: ", r.cid_ipfs);
          return null;
        }
      }),
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ erro: "erro ao obter os dados de registros do axolote" });
  }
};

const obterDadosIPFSAquario = async (req, res) => {
  try {
    const { id } = req.params;

    //Buscando dados de registro.
    const registros = await registroAxoloteModel.obterRegistrosPorAquario(id);

    const dados = await Promise.all(
      registros.map(async (r) => {
        try {
          const json = await getFromIPFS(r.cid_ipfs);
          console.log(r.cid_ipfs);
          console.log(json);
        } catch (err) {
          console.error("Erro ao obter o CID: ", r.cid_ipfs);
          return null;
        }
      }),
    );
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ erro: "erro ao obter os dados de registros do aquário" });
  }
};

const obterPesoTamanhoAxolote = async (req, res) => {
  try {
    const { id } = req.params;

    //Buscando registros no banco.
    const registros = await registroAxoloteModel.obterRegistrosPorAxolote(id);

    //Buscando dados no IPFS.
    const dados = await Promise.all(
      registros.map(async (r) => {
        try {
          const json = await getFromIPFS(r.cid_ipfs);
          console.log(r.cid_ipfs);
          console.log(json);

          const medicalRecords = json.medicalRecords || [];

          return medicalRecords.map((r) => ({
            data: r.date,
            peso: Number(r.weight) || 0,
            tamanho: Number(r.length) || 0,
          }));
        } catch (err) {
          console.error("Erro no CID:", r.cid_ipfs);
          return null;
        }
      }),
    );

    //Criando um novo array com os dados.
    const resultado = dados.flat();

    //Ordenando resultados (por data).
    resultado.sort((a, b) => new Date(a.data) - new Date(b.data));
    console.log("Resultado final: ", resultado);
    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao obter histórico" });
  }
};

const obterTempPHAquario = async (req, res) => {
  try {
    const { id } = req.params;

    const registros = await registroAquarioModel.obterRegistrosPorAquario(id);

    const dados = await Promise.all(
      registros.map(async (r) => {
        try {
          const json = await getFromIPFS(r.cid_ipfs);

          const records = json.waterQualityRecords || [];

          console.log("JSON COMPLETO:", json);
          console.log("waterQualityRecords:", json.waterQualityRecords);

          return records.map((rec) => ({
            data: rec.date,
            temperatura: Number(rec.physicalConditions?.temperature) || 0,
            ph:
              Number(
                rec.basicChemistry?.phPotentiometer ??
                  rec.basicChemistry?.phReagent,
              ) || 0,
          }));
        } catch (err) {
          console.error("Erro no CID:", r.cid_ipfs);
          return [];
        }
      }),
    );

    const resultado = dados.flat();

    resultado.sort((a, b) => new Date(a.data) - new Date(b.data));

    res.json(resultado);
    console.log("Resultado do aquário: ", resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao obter histórico do aquário" });
  }
};

const obterResumoAxolote = async (req, res) => {
  try {
    const { id } = req.params;

    const registros = await registroAxoloteModel.obterRegistrosPorAxolote(id);

    const dados = await Promise.all(
      registros.map(async (r) => {
        try {
          const json = await getFromIPFS(r.cid_ipfs);

          const medicalRecords = json.medicalRecords || [];
          const feedingRecords = json.feedingRecords || [];

          return {
            medical: medicalRecords.map((m) => ({
              data: m.date,
              peso: Number(m.weight) || 0,
              tamanho: Number(m.length) || 0,
            })),
            feeding: feedingRecords.map((f) => ({
              data: f.date,
              alimentacao: f.food || "Não informado",
            })),
          };
        } catch (err) {
          console.error("Erro no CID:", r.cid_ipfs);
          return { medical: [], feeding: [] };
        }
      }),
    );

    //Juntando os registros.
    const medical = dados.flatMap((d) => d.medical);
    const feeding = dados.flatMap((d) => d.feeding);

    //Ordenando os registros por data.
    medical.sort((a, b) => new Date(a.data) - new Date(b.data));
    feeding.sort((a, b) => new Date(a.data) - new Date(b.data));

    //Buscando últimos valores.
    const ultimoMedical = medical[medical.length - 1] || {};
    const ultimoFeeding = feeding[feeding.length - 1] || {};

    res.json({
      historico: medical,
      resumo: {
        peso: ultimoMedical.peso || null,
        tamanho: ultimoMedical.tamanho || null,
        alimentacao: ultimoFeeding.alimentacao || null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao obter resumo do axolote" });
  }
};

//Exportando as funcoes.
module.exports = {
  criarRegistroAxolote,
  criarRegistroAquario,
  listarRegistrosAxolote,
  listarRegistrosAquario,
  atualizarStatusAxolote,
  atualizarStatusAquario,
  salvarOnchainAxolote,
  salvarOnchainAquario,
  criarRegistroAuditoria,
  obterDadosIPFSAxolote,
  obterDadosIPFSAquario,
  obterPesoTamanhoAxolote,
  obterTempPHAquario,
  obterResumoAxolote,
};
