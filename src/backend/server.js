//Importação de bibliotecas.
require("dotenv").config();
const express = require("express");
const cors = require("cors");

//Importando as rotas do usuário.
const usuariosRoutes = require("./routes/usuariosRoutes");

//Importando as rotas do aquário.
const aquarioRoutes = require("./routes/aquarioRoutes");

//Importando as rotas do axolote.
const axoloteRoutes = require("./routes/axoloteRoutes");

//Importando as rotas dos registros.
const registroRoutes = require("./routes/registroRoutes");

//Importando as rotas de exportacao.
const exportRoutes = require("./routes/exportRoutes");

//Importando as rotas de autenticação.
const authRoutes = require("./routes/authRoutes");

//Importando as rotas de instituições.
const instituicoesRoutes = require ("./routes/instituicaoRoutes");

//Importando as rotas de solicitação de roles.
const solicitacaoRoutes = require("./routes/solicitacaoRoutes");

//Criando uma instância de express para essa aplicação.
const app = express();

//Utilizando a biblioteca Cors (para compartilhar recursos de diferentes origens) e o express com json.
app.use(cors());
app.use(express.json());

//Usando a rota de usuários.
app.use("/usuarios", usuariosRoutes);

//Usando a rota de aquários.
app.use("/aquarios", aquarioRoutes);

//Usando a rota de axolotes.
app.use("/axolotes", axoloteRoutes);

//Usando a rota de registros.
app.use("/registros", registroRoutes);

//Usando a rota de exportacao.
app.use("/export", exportRoutes);

//Usando a rota de autenticação.
app.use("/auth", authRoutes);

//Usando a rota de instituições;
app.use("/instituicoes", instituicoesRoutes);

//Usando a rota de solicitações.
app.use("/solicitacoes", solicitacaoRoutes);

const PORT = process.env.PORT || 3000;

//Mostrando que o servidor está rodando na porta 3000.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
