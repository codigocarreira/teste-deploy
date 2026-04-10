//Importação de bibliotecas.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

//Dados para conexão com o banco (com base no arquivo .env).
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});


//Função para rodar o script SQL e criar as tabelas no Supabase.
const runSQLScript = async () => {
  const filePath = path.join(__dirname, 'init.sql');
  const sql = fs.readFileSync(filePath, 'utf8');

  try {
    console.log(process.env.DB_HOST)
    await pool.query(sql);
    console.log('Script SQL executado com sucesso!');
  } catch (err) {
    console.error('Erro ao executar o script SQL:', err);
  } finally {
    await pool.end();
  }
};

//Rodando a função para criar as tabelas.
runSQLScript();