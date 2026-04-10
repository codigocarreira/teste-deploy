import axios from "axios";

//Configurações do IPFS.
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY =
  process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

//Cache.
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 5; 

//Instância do axios com timeout para evitar travamentos.
const api = axios.create({
  timeout: 8000,
});

//Upload para IPFS.
export async function uploadToIPFS(jsonData, fileName) {
  try {
    if (!PINATA_JWT) {
      throw new Error("PINATA_JWT não configurado no .env");
    }

    const response = await api.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        pinataContent: jsonData,
        pinataMetadata: {
          name: fileName || "axolodao-dataset",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error("Erro ao fazer upload no IPFS:", error.message);
    throw new Error("Falha ao enviar dados para o IPFS");
  }
}

//Buscar do IPFS com cache (otimização de tempo).
export async function getFromIPFS(cid) {
  try {
    if (!cid) throw new Error("CID inválido");

    const now = Date.now();

    //Verificando cache e expiração.
    if (cache.has(cid)) {
      const { data, timestamp } = cache.get(cid);

      if (now - timestamp < CACHE_TTL) {
        return data;
      } else {
        cache.delete(cid);
      }
    }

    const response = await api.get(`${PINATA_GATEWAY}/ipfs/${cid}`);

    //Salva no cache com timestamp.
    cache.set(cid, {
      data: response.data,
      timestamp: now,
    });

    return response.data;

  } catch (error) {
    console.error(`Erro ao buscar CID ${cid}:`, error.message);
    throw new Error("Erro ao buscar dados no IPFS");
  }
}