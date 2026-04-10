//Constante com os dados para conexao com o banco.
const pool = require("../config/db");

//Criando registro de axolote no banco.
const criarRegistroAxolote = async ({
  fk_axolote_id,
  fk_operador_id,
  cid_ipfs,
  data_ultima_medicao,
}) => {
  const query = `INSERT INTO "Registro_Axolote"(fk_axolote_id, fk_operador_id, cid_ipfs, data_ultima_alteracao, data_ultima_medicao)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *`;
  const values = [fk_axolote_id, fk_operador_id, cid_ipfs, data_ultima_medicao];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Obtendo registros de um axolote.
const obterRegistrosPorAxolote = async (axoloteId) => {
  const result = await pool.query(
    `SELECT  fk_axolote_id, cid_ipfs, data_ultima_medicao FROM "Registro_Axolote" WHERE fk_axolote_id = $1 ORDER BY data_ultima_medicao ASC`,
    [axoloteId],
  );
  return result.rows;
};
const obterTodosRegistrosAxolote = async () => {
  const result = await pool.query(`
    SELECT
      ra.id,
      ra.fk_axolote_id,
      ra.fk_operador_id,
      ra.status_auditoria,
      ra.cid_ipfs,
      ra.data_registro,
      ra.data_ultima_alteracao,
      ra.data_ultima_medicao,
      ra.tx_hash,
      ra.onchain_entity_id,
      ra.onchain_record_id,
      a.fk_instituicao_id AS institution_id,
      i.blockchain_id AS institution_blockchain_id
    FROM "Registro_Axolote" ra
    JOIN "Axolote" a
      ON a.id = ra.fk_axolote_id
    JOIN "Instituicoes" i
      ON i.id = a.fk_instituicao_id
    ORDER BY ra.data_registro DESC
  `);

  return result.rows;
};

//Atualizando status de auditoria de um registro de axolote (com CID de auditoria).
const atualizarStatusRegistroAxolote = async (
  id,
  status,
  auditorId,
  cidAuditoria,
) => {
  const query = `UPDATE "Registro_Axolote" SET status_auditoria = $1, fk_auditor_id = $2, cid_ipfs_auditoria = $3, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
  const values = [status, auditorId, cidAuditoria, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Salvando tx_hash da blockchain no registro.
const salvarTxHashAxolote = async (id, txHash) => {
  const query = `UPDATE "Registro_Axolote" SET tx_hash = $1, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  const values = [txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Salvando IDs on-chain no registro.
const salvarOnchainIdsAxolote = async (
  id,
  onchainEntityId,
  onchainRecordId,
  txHash,
) => {
  const query = `UPDATE "Registro_Axolote" SET onchain_entity_id = $1, onchain_record_id = $2, tx_hash = $3, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
  const values = [onchainEntityId, onchainRecordId, txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Exportando as funcoes.
module.exports = {
  criarRegistroAxolote,
  obterRegistrosPorAxolote,
  obterTodosRegistrosAxolote,
  atualizarStatusRegistroAxolote,
  salvarTxHashAxolote,
  salvarOnchainIdsAxolote,
};
