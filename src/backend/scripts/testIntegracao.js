//Script completo de teste de integracao.
//Testa IPFS, endpoints de registro (axolote e aquario), e verificacao de integridade.
require("dotenv").config();

const { uploadToIPFS, getFromIPFS } = require("../services/ipfsService");

//Contadores de resultado.
let totalTestes = 0;
let testesOk = 0;
let testesFalha = 0;

//Funcao auxiliar para registrar resultado.
function resultado(nome, sucesso, detalhe) {
  totalTestes++;
  if (sucesso) {
    testesOk++;
    console.log("[OK] " + nome + (detalhe ? " - " + detalhe : ""));
  } else {
    testesFalha++;
    console.log("[FALHA] " + nome + (detalhe ? " - " + detalhe : ""));
  }
}

//Dados de teste simulando um registro de axolote.
const dadosAxolote = {
  schemaVersion: "1.0.0",
  datasetType: "axolote",
  timestamp: new Date().toISOString(),
  author: "Teste automatizado",
  medicalRecords: [
    {
      specimen: "AX-001",
      date: "2026-03-13",
      weight: "180g",
      length: "21cm",
      reason: "Check-up de rotina",
      notes: "Teste de integracao"
    }
  ]
};

//Dados de teste simulando um registro de aquario.
const dadosAquario = {
  schemaVersion: "1.0.0",
  datasetType: "environment",
  timestamp: new Date().toISOString(),
  author: "Teste automatizado",
  waterQualityRecords: [
    {
      date: "2026-03-13",
      tank: "TQ-001",
      physicalConditions: {
        temperature: "16.5",
        turbidity: "2.1"
      },
      basicChemistry: {
        phReagent: "7.2",
        alkalinity: "110"
      }
    }
  ]
};

//Teste 1: Upload de JSON para o IPFS.
async function testeIPFSUpload() {
  console.log("\nTeste 1: Upload IPFS");
  try {
    const cid = await uploadToIPFS(dadosAxolote, "teste_upload");
    resultado("Upload retornou CID", !!cid, cid);
    return cid;
  } catch (error) {
    resultado("Upload retornou CID", false, error.message);
    return null;
  }
}

//Teste 2: Download do JSON pelo CID e verificacao de integridade.
async function testeIPFSDownload(cid) {
  console.log("\nTeste 2: Download IPFS e verificacao");
  if (!cid) {
    resultado("Download depende de CID valido", false, "CID nulo");
    return;
  }

  try {
    const recuperado = await getFromIPFS(cid);
    resultado("Download retornou dados", !!recuperado);

    //Verificando se o conteudo e identico ao original.
    const original = JSON.stringify(dadosAxolote);
    const baixado = JSON.stringify(recuperado);
    resultado("Conteudo identico ao original", original === baixado);
  } catch (error) {
    resultado("Download do IPFS", false, error.message);
  }
}

//Teste 3: POST /registros/axolote no backend.
async function testeEndpointAxolote() {
  console.log("\nTeste 3: POST /registros/axolote");
  try {
    const response = await fetch("http://localhost:3000/registros/axolote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        axoloteId: 1,
        operadorId: 1,
        dados: dadosAxolote,
        dataMedicao: "2026-03-13"
      })
    });

    const data = await response.json();
    resultado("Status HTTP 201", response.status === 201, "status " + response.status);
    resultado("Retornou CID", !!data.cid, data.cid);
    resultado("Retornou registro com ID", !!data.registro?.id, "id " + data.registro?.id);
    resultado("Status auditoria PENDENTE", data.registro?.status_auditoria === "PENDENTE");
    resultado("CID no banco bate com retorno", data.registro?.cid_ipfs === data.cid);
    return data;
  } catch (error) {
    resultado("Conexao com backend", false, error.message);
    return null;
  }
}

//Teste 4: POST /registros/aquario no backend.
async function testeEndpointAquario() {
  console.log("\nTeste 4: POST /registros/aquario");
  try {
    const response = await fetch("http://localhost:3000/registros/aquario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aquarioId: 1,
        operadorId: 1,
        dados: dadosAquario,
        dataMedicao: "2026-03-13"
      })
    });

    const data = await response.json();
    resultado("Status HTTP 201", response.status === 201, "status " + response.status);
    resultado("Retornou CID", !!data.cid, data.cid);
    resultado("Retornou registro com ID", !!data.registro?.id, "id " + data.registro?.id);
    return data;
  } catch (error) {
    resultado("Conexao com backend", false, error.message);
    return null;
  }
}

//Teste 5: GET /registros/axolote (listar registros).
async function testeListarAxolote() {
  console.log("\nTeste 5: GET /registros/axolote");
  try {
    const response = await fetch("http://localhost:3000/registros/axolote");
    const data = await response.json();
    resultado("Retornou array", Array.isArray(data));
    resultado("Tem pelo menos 1 registro", data.length > 0, "total " + data.length);
    resultado("Primeiro registro tem cid_ipfs", !!data[0]?.cid_ipfs);
  } catch (error) {
    resultado("Listar registros", false, error.message);
  }
}

//Teste 6: GET /registros/aquario (listar registros).
async function testeListarAquario() {
  console.log("\nTeste 6: GET /registros/aquario");
  try {
    const response = await fetch("http://localhost:3000/registros/aquario");
    const data = await response.json();
    resultado("Retornou array", Array.isArray(data));
    resultado("Tem pelo menos 1 registro", data.length > 0, "total " + data.length);
  } catch (error) {
    resultado("Listar registros aquario", false, error.message);
  }
}

//Teste 7: Verificacao cruzada (CID do banco bate com conteudo do IPFS).
async function testeVerificacaoCruzada(dadosEndpoint) {
  console.log("\nTeste 7: Verificacao cruzada banco x IPFS");
  if (!dadosEndpoint?.cid) {
    resultado("Depende do CID do endpoint", false, "sem dados");
    return;
  }

  try {
    const conteudoIPFS = await getFromIPFS(dadosEndpoint.cid);
    resultado("Conteudo do IPFS acessivel pelo CID do banco", !!conteudoIPFS);

    const enviadoStr = JSON.stringify(dadosAxolote);
    const ipfsStr = JSON.stringify(conteudoIPFS);
    resultado("Conteudo no IPFS bate com o enviado", enviadoStr === ipfsStr);
  } catch (error) {
    resultado("Verificacao cruzada", false, error.message);
  }
}

//Execucao de todos os testes.
async function executarTodos() {
  console.log("Testes de integracao - AxoloDAO\n");

  const cid = await testeIPFSUpload();
  await testeIPFSDownload(cid);
  const dadosAxoloteEndpoint = await testeEndpointAxolote();
  await testeEndpointAquario();
  await testeListarAxolote();
  await testeListarAquario();
  await testeVerificacaoCruzada(dadosAxoloteEndpoint);

  console.log("\nResultado: " + testesOk + "/" + totalTestes + " passaram");
  if (testesFalha > 0) {
    console.log(testesFalha + " teste(s) falharam");
  } else {
    console.log("Todos os testes passaram!");
  }

  process.exit(testesFalha > 0 ? 1 : 0);
}

executarTodos();
