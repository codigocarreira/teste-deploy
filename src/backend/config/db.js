//configurando e exportando a conexão com o banco de dados.
const { Pool } = require('pg');
require('dotenv').config();

//Constante para armazenar os dados de conexão.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

//Exportando os dados para conexão.
module.exports = pool;