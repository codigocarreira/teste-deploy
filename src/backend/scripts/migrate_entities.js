require("dotenv").config();
const pool = require("../config/db");

async function run() {
  console.log("Adicionando colunas blockchain nas tabelas Axolote e Aquario...");

  await pool.query(`
    ALTER TABLE "Axolote"
    ADD COLUMN IF NOT EXISTS cid_ipfs VARCHAR(100),
    ADD COLUMN IF NOT EXISTS onchain_entity_id INT,
    ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66)
  `);
  console.log("Axolote atualizado.");

  await pool.query(`
    ALTER TABLE "Aquario"
    ADD COLUMN IF NOT EXISTS cid_ipfs VARCHAR(100),
    ADD COLUMN IF NOT EXISTS onchain_entity_id INT,
    ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66)
  `);
  console.log("Aquario atualizado.");

  console.log("Migracao concluida!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Erro:", e);
  process.exit(1);
});
