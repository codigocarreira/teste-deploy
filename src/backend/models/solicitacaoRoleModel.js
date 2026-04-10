const pool = require("../config/db");

const criarSolicitacao = async ({ nome, carteira, ens, role, fk_instituicao_id, blockchain_institution_id }) => {
  const result = await pool.query(
    `INSERT INTO "solicitacao"
     (nome_usuario, carteira_metamask, ens, role_desejada, fk_instituicao_id, blockchain_institution_id)
     VALUES ($1, LOWER($2), $3, $4, $5, $6)
     RETURNING *`,
    [nome, carteira, ens, role, fk_instituicao_id, blockchain_institution_id]
  );
  return result.rows[0];
};

const obterNotificacoesAdmin = async (instituicaoId) => {
  const result = await pool.query(
    `SELECT * FROM "solicitacao"
     WHERE fk_instituicao_id = $1
     AND role_desejada IN ('OPERATOR', 'VALIDATOR')
     AND status = 'PENDING'
     AND viewed = false
     ORDER BY created_at DESC`,
    [instituicaoId]
  );
  return result.rows;
};

const obterNotificacoesSuperAdmin = async () => {
  const result = await pool.query(
    `SELECT * FROM "solicitacao"
     WHERE role_desejada = 'ADMIN'
     AND status = 'PENDING'
     AND viewed = false
     ORDER BY created_at DESC`
  );
  return result.rows;
};

const obterSolicitacoesPorInstituicao = async (instituicaoId, status, roles) => {
  let query = `SELECT * FROM "solicitacao" WHERE fk_instituicao_id = $1`;
  const params = [instituicaoId];

  if (status) {
    query += ` AND status = $2`;
    params.push(status);
  }

  if (roles && roles.length > 0) {
    query += ` AND role_desejada = ANY($${params.length + 1})`;
    params.push(roles);
  }

  query += ` ORDER BY created_at DESC`;
  const result = await pool.query(query, params);
  return result.rows;
};

const obterSolicitacaoPorId = async (id) => {
  const result = await pool.query(`SELECT * FROM "solicitacao" WHERE id = $1`, [id]);
  return result.rows[0];
};

const atualizarStatusSolicitacao = async (id, status) => {
  await pool.query(
    `UPDATE "solicitacao" SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [status, id]
  );
};

const obterNotificacoesUsuario = async (wallet) => {
  const result = await pool.query(
    `SELECT * FROM "solicitacao"
     WHERE LOWER(carteira_metamask) = LOWER($1)
     AND status != 'PENDING'
     AND viewed = false
     ORDER BY updated_at DESC`,
    [wallet]
  );
  return result.rows;
};

const marcarComoVisto = async (id) => {
  await pool.query(`UPDATE "solicitacao" SET viewed = true WHERE id = $1`, [id]);
};

module.exports = {
  criarSolicitacao,
  obterSolicitacoesPorInstituicao,
  obterSolicitacaoPorId,
  atualizarStatusSolicitacao,
  obterNotificacoesAdmin,
  obterNotificacoesSuperAdmin,
  obterNotificacoesUsuario,
  marcarComoVisto
};