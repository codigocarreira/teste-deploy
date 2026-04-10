require("dotenv").config();
const pool = require("../config/db");

async function run() {
  console.log("Rodando migracao...");

  await pool.query(`
    ALTER TABLE "Registro_Axolote"
    ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66),
    ADD COLUMN IF NOT EXISTS cid_ipfs_auditoria VARCHAR(100)
  `);
  console.log("Registro_Axolote atualizado.");

  await pool.query(`
    ALTER TABLE "Registro_Aquario"
    ADD COLUMN IF NOT EXISTS tx_hash VARCHAR(66),
    ADD COLUMN IF NOT EXISTS cid_ipfs_auditoria VARCHAR(100)
  `);
  console.log("Registro_Aquario atualizado.");

  console.log("Migracao concluida!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Erro na migracao:", e);
  process.exit(1);
});
