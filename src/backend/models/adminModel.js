//Chamando a conexão com o banco de dados.
const pool = require("../config/db");

//Função para criar administradores.
const criarAdmin = async ({ nome, carteira_metamask, fk_instituicao_id }) => {
  const result = await pool.query(
    `INSERT INTO "Administrador" (nome, carteira_metamask, fk_instituicao_id)
     VALUES ($1, LOWER($2), $3)
     ON CONFLICT (carteira_metamask) DO NOTHING
     RETURNING *`,
    [nome, carteira_metamask, fk_instituicao_id]
  );

  return result.rows[0] || await obterAdminPorWallet(carteira_metamask);
};

//Função para obter todos os admins cadastrados no banco.
const obterAdmins = async () => {
  const result = await pool.query(`SELECT * FROM "Administrador"`);
  return result.rows;

};

//Função para obter admins por sua carteira metamask registrada no banco.
const obterAdminPorWallet = async (wallet) => {
  const result = await pool.query(
    `SELECT * FROM "Administrador"
     WHERE LOWER(carteira_metamask) = LOWER($1)`,
    [wallet]
  );

  return result.rows[0];

};

//Exportando as funções para o controller.
module.exports = { criarAdmin, obterAdmins, obterAdminPorWallet };
