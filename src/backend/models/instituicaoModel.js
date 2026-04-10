const pool = require("../config/db");

//Criando ou obtendo instituição garantindo vínculo blockchain_id,
const criarOuObterInstituicao = async ({ nome, dominio, blockchain_id }) => {
  console.log("[InstituicaoModel] Sync:", {
    nome,
    dominio,
    blockchain_id
  });


  let result = await pool.query(
    `SELECT * FROM "Instituicoes" WHERE blockchain_id = $1`,
    [blockchain_id]
  );

  if (result.rows.length > 0) {
    console.log("Instituição encontrada por blockchain_id");
    return result.rows[0];
  }

  result = await pool.query(
    `SELECT * FROM "Instituicoes" WHERE LOWER(dominio) = LOWER($1)`,
    [dominio]
  );

  if (result.rows.length > 0) {
    console.log("Atualizando instituição existente com blockchain_id");

    const update = await pool.query(
      `UPDATE "Instituicoes"
       SET blockchain_id = $1
       WHERE id = $2
       RETURNING *`,
      [blockchain_id, result.rows[0].id]
    );

    return update.rows[0];
  }

  console.log("Criando nova instituição");

  const insert = await pool.query(
    `INSERT INTO "Instituicoes" (nome, dominio, blockchain_id)
     VALUES ($1, LOWER($2), $3)
     RETURNING *`,
    [nome, dominio, blockchain_id]
  );

  return insert.rows[0];
};

const criarDominio = async ({ nome, dominio, blockchain_id }) => {
  const result = await pool.query(
    `INSERT INTO "Instituicoes" (nome, dominio, blockchain_id)
     VALUES ($1, LOWER($2), $3)
     ON CONFLICT (dominio)
     DO UPDATE SET blockchain_id = EXCLUDED.blockchain_id
     RETURNING *`,
    [nome, dominio, blockchain_id]
  );

  return result.rows[0];
};

const obterDominioPorNome = async (dominio) => {
  const result = await pool.query(
    `SELECT * FROM "Instituicoes" WHERE LOWER(dominio) = LOWER($1)`,
    [dominio]
  );
  return result.rows[0];
};

const obterTodosDominios = async () => {
  const result = await pool.query(`SELECT * FROM "Instituicoes"`);
  return result.rows;
};

module.exports = {
  criarDominio,
  obterDominioPorNome,
  obterTodosDominios,
  criarOuObterInstituicao
};