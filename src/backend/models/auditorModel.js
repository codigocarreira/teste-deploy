const pool = require("../config/db");

const obterAuditores = async () => {
  const result = await pool.query('SELECT * FROM "Auditor"');
  return result.rows;
};

const obterAuditorPorWallet = async (wallet) => {
  const result = await pool.query(
    `SELECT * FROM "Auditor" WHERE LOWER(carteira_metamask) = LOWER($1)`,
    [wallet.trim()],
  );
  return result.rows[0];
};

const criarAuditor = async ({
  nome,
  carteira_metamask,
  fk_administrador_id,
  fk_instituicao_id,
}) => {
  const result = await pool.query(
    `INSERT INTO "Auditor"
     (nome, carteira_metamask, fk_administrador_id, fk_instituicao_id, status, ativo)
     VALUES ($1, LOWER($2), $3, $4, 'PENDING', false)
     RETURNING *`,
    [nome, carteira_metamask, fk_administrador_id, fk_instituicao_id],
  );

  return result.rows[0];
};

const ativarAuditor = async (wallet) => {
  await pool.query(
    `UPDATE "Auditor"
     SET status = 'ACTIVE', ativo = true
     WHERE LOWER(carteira_metamask) = LOWER($1)`,
    [wallet],
  );
};

module.exports = {
  obterAuditores,
  obterAuditorPorWallet,
  criarAuditor,
  ativarAuditor,
};
