//Constante com os dados para conexão com o banco.
const pool = require("../config/db");

//Obtendo todos os aquários no banco.
const obterAquarios = async () => {
  const result = await pool.query('SELECT * FROM "Aquario"');
  return result.rows;
};

//Obtendo um aquario por id.
const obterAquarioPorId = async (id) => {
  const result = await pool.query('SELECT * FROM "Aquario" WHERE id = $1', [
    id,
  ]);
  return result.rows[0];
};

//Criando novo aquário.
const criarAquario = async (aquario) => {
  const num = (v) => (v === "" || v === undefined || v === null ? 0 : v);

  const query = `
    INSERT INTO "Aquario" (
      codigo_tanque, localizacao, volume_nominal, volume_efetivo,
      altura_nominal, altura_efetiva, largura, comprimento,
      tipo_tanque, tipo_sistema, tipo_sustrato, tipo_filtro, tipo_aireador,
      descricao_marca_modelo, lista_especies, quant_exemplares,
      fk_operador_id, fk_instituicao_id, imagem_url
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
    RETURNING *
  `;

  const values = [
    aquario.codigo_tanque,
    aquario.localizacao,
    num(aquario.volume_nominal),
    num(aquario.volume_efetivo),
    num(aquario.altura_nominal),
    num(aquario.altura_efetiva),
    num(aquario.largura),
    num(aquario.comprimento),
    aquario.tipo_tanque || "",
    aquario.tipo_sistema || "",
    aquario.tipo_sustrato || "",
    aquario.tipo_filtro || "",
    aquario.tipo_aireador || "",
    aquario.descricao_marca_modelo || "",
    aquario.lista_especies || "",
    num(aquario.quant_exemplares),
    aquario.fk_operador_id,
    aquario.fk_instituicao_id,
    aquario.imagem_url,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};
//Salvando dados on-chain no aquario.
const salvarOnchainAquario = async (id, cidIpfs, onchainEntityId, txHash) => {
  const query = `UPDATE "Aquario" SET cid_ipfs = $1, onchain_entity_id = $2, tx_hash = $3 WHERE id = $4 RETURNING *`;
  const values = [cidIpfs, onchainEntityId, txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Exportando as funcoes.
module.exports = {
  obterAquarios,
  obterAquarioPorId,
  criarAquario,
  salvarOnchainAquario,
};
