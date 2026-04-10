//Constante com os dados para conexao com o banco.
const pool = require("../config/db");

//Criando registro de aquario no banco.
const criarRegistroAquario = async ({
  fk_aquario_id,
  fk_operador_id,
  cid_ipfs,
  data_ultima_medicao,
}) => {
  const query = `INSERT INTO "Registro_Aquario"(fk_aquario_id, fk_operador_id, cid_ipfs, data_ultima_alteracao, data_ultima_medicao)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4) RETURNING *`;
  const values = [fk_aquario_id, fk_operador_id, cid_ipfs, data_ultima_medicao];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Obtendo registros de um aquario.
const obterRegistrosPorAquario = async (aquarioId) => {
  const result = await pool.query(
    'SELECT * FROM "Registro_Aquario" WHERE fk_aquario_id = $1 ORDER BY data_registro DESC',
    [aquarioId],
  );
  return result.rows;
};

//Obtendo todos os registros de aquario.
const obterTodosRegistrosAquario = async () => {
  const result = await pool.query(`
    SELECT
      ra.id,
      ra.fk_aquario_id,
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
    FROM "Registro_Aquario" ra
    JOIN "Aquario" a
      ON a.id = ra.fk_aquario_id
    JOIN "Instituicoes" i
      ON i.id = a.fk_instituicao_id
    ORDER BY ra.data_registro DESC
  `);

  return result.rows;
};

//Atualizando status de auditoria de um registro de aquario (com CID de auditoria).
const atualizarStatusRegistroAquario = async (
  id,
  status,
  auditorId,
  cidAuditoria,
) => {
  const query = `UPDATE "Registro_Aquario" SET status_auditoria = $1, fk_auditor_id = $2, cid_ipfs_auditoria = $3, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
  const values = [status, auditorId, cidAuditoria, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Salvando tx_hash da blockchain no registro.
const salvarTxHashAquario = async (id, txHash) => {
  const query = `UPDATE "Registro_Aquario" SET tx_hash = $1, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`;
  const values = [txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Salvando IDs on-chain no registro.
const salvarOnchainIdsAquario = async (
  id,
  onchainEntityId,
  onchainRecordId,
  txHash,
) => {
  const query = `UPDATE "Registro_Aquario" SET onchain_entity_id = $1, onchain_record_id = $2, tx_hash = $3, data_ultima_alteracao = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`;
  const values = [onchainEntityId, onchainRecordId, txHash, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

//Exportando as funcoes.
module.exports = {
  criarRegistroAquario,
  obterRegistrosPorAquario,
  obterTodosRegistrosAquario,
  atualizarStatusRegistroAquario,
  salvarTxHashAquario,
  salvarOnchainIdsAquario,
};
