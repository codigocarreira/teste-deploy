const pool = require("../config/db");

const obterOperadores = async () => {
  const result = await pool.query('SELECT * FROM "Operador"');
  return result.rows;
};

const obterOperadorPorWallet = async (wallet) => {
  const result = await pool.query(
    `SELECT * FROM "Operador" WHERE LOWER(carteira_metamask) = LOWER($1)`,
    [wallet],
  );
  return result.rows[0];
};

const criarOperador = async ({
  nome,
  carteira_metamask,
  fk_administrador_id,
  fk_instituicao_id,
}) => {
  const result = await pool.query(
    `INSERT INTO "Operador"
     (nome, carteira_metamask, fk_administrador_id, fk_instituicao_id, status, ativo)
     VALUES ($1, LOWER($2), $3, $4, 'PENDING', false)
     RETURNING *`,
    [nome, carteira_metamask, fk_administrador_id, fk_instituicao_id],
  );

  return result.rows[0];
};

const ativarOperador = async (wallet) => {
  await pool.query(
    `UPDATE "Operador"
     SET status = 'ACTIVE', ativo = true
     WHERE LOWER(carteira_metamask) = LOWER($1)`,
    [wallet],
  );
};

module.exports = {
  obterOperadores,
  obterOperadorPorWallet,
  criarOperador,
  ativarOperador,
};
