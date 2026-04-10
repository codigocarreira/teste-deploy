//Teste rapido do servico IPFS.
//Roda: node scripts/testIPFS.js
require("dotenv").config();
const { uploadToIPFS, getFromIPFS } = require("../services/ipfsService");

async function main() {
    console.log("=== Teste IPFS (Pinata) ===\n");

    //Subindo um JSON de teste.
    const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "AxoloDAO IPFS test"
    };

    console.log("1. Subindo JSON de teste...");
    const cid = await uploadToIPFS(testData, "teste-ipfs");
    console.log("   CID recebido:", cid);

    //Recuperando o JSON pelo CID.
    console.log("\n2. Recuperando JSON pelo CID...");
    const recovered = await getFromIPFS(cid);
    console.log("   JSON recuperado:", JSON.stringify(recovered));

    //Verificando integridade.
    const match = recovered.message === testData.message;
    console.log("\n3. Integridade:", match ? "OK" : "FALHOU");
}

main().catch(err => {
    console.error("ERRO:", err.message);
    process.exit(1);
});
