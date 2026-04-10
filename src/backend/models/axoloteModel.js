//Constante com os dados para conexão com o banco.
const pool = require("../config/db");

//Obtendo todos os axolotes no banco.
const obterAxolotes = async () => {
  const result = await pool.query('SELECT * FROM "Axolote"');
  return result.rows;
};

//Obtendo um axolote por id.
const obterAxolotePorId = async (id) => {
  const result = await pool.query('SELECT * FROM "Axolote" WHERE id = $1', [
    id,
  ]);
  return result.rows[0];
};

//Criando axolote no banco de dados.
const criarAxolote = async (axolote) => {
  const query = `INSERT INTO "Axolote" (nome_cientifico, especie_apelido, cod_exemplar, data_nasc, marcas_distintivas, esta_vivo, fk_operador_id, fk_aquario_id, fk_instituicao_id, imagem_url, cor, sexo) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`;
  const values = [
    axolote.nome_cientifico || "",
    axolote.especie_apelido || "",
    axolote.cod_exemplar,
    axolote.data_nasc || null,
    axolote.marcas_distintivas || "",
    axolote.esta_vivo,
    axolote.fk_operador_id,
    axolote.fk_aquario_id || null,
    axolote.fk_instituicao_id,
    axolote.imagem_url,
    axolote.cor || null,
    axolote.sexo || null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Salvando dados on-chain no axolote.
const salvarOnchainAxolote = async (id, cidIpfs, onchainEntityId, txHash) => {
  const query = `UPDATE "Axolote" SET cid_ipfs = $1, onchain_entity_id = $2, tx_hash = $3 WHERE id = $4 RETURNING *`;
  const values = [cidIpfs, onchainEntityId, txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Exportando as funcoes.
module.exports = {
  criarAxolote,
  obterAxolotes,
  obterAxolotePorId,
  salvarOnchainAxolote,
};
