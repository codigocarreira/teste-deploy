require("dotenv").config();
const pool = require("../config/db");

(async () => {
  const aq = await pool.query('SELECT * FROM "Registro_Aquario" LIMIT 1');
  console.log("Aquario record columns:", JSON.stringify(Object.keys(aq.rows[0])));
  console.log("Aquario record 1:", JSON.stringify(aq.rows[0]));
  process.exit(0);
})();
