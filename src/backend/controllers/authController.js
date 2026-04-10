const crypto = require("crypto");
const { ethers } = require("ethers");
const { getRoles } = require("../services/roleService");
const {obterDominioPorNome, criarDominio} = require("../models/instituicaoModel");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
const ensRegistry = new ethers.Contract(ENS_REGISTRY, ["function owner(bytes32 node) view returns (address)"],provider);

const nonces = new Map();

const getNonce = (req, res) => {
  const nonce = crypto.randomBytes(16).toString("hex");
  nonces.set(nonce, true);
  res.json({ nonce });
};

function getEnsHierarchy(ens) {
  const parts = ens.toLowerCase().split(".");
  const levels = [];

  for (let i = 0; i < parts.length - 1; i++) {
    levels.push(parts.slice(i).join("."));
  }

  return levels;
}

const loginENS = async (req, res) => {
  try {
    const { message, signature, ens } = req.body;

    if (!message || !signature || !ens) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

  
    const wallet = ethers.getAddress(
      ethers.verifyMessage(message, signature)
    );

   
    const nonce = message.match(/Nonce:\s*(.*)/)?.[1]?.trim();

    if (!nonce || !nonces.has(nonce)) {
      return res.status(403).json({ error: "Nonce inválido" });
    }

    nonces.delete(nonce);

 
    const hierarchy = getEnsHierarchy(ens);

    let isAdmin = false;
    let isOperatorByENS = false;

    for (const node of hierarchy) {
      const owner = await ensRegistry.owner(ethers.namehash(node));

      if (owner && owner.toLowerCase() === wallet.toLowerCase()) {
        isAdmin = true;
      }
    }

    const ownerExact = await ensRegistry.owner(
      ethers.namehash(ens.toLowerCase())
    );

    if (ownerExact && ownerExact.toLowerCase() === wallet.toLowerCase()) {
      isOperatorByENS = true;
    }

    const parts = ens.split(".");
    const dominioPrincipal = parts[parts.length - 2];

    let instituicao = await obterDominioPorNome(dominioPrincipal);

    if (!instituicao) {
      instituicao = await criarDominio({
        nome: dominioPrincipal,
        dominio: dominioPrincipal
      });
    }

    const institutionId = instituicao?.id || 0;

    const rolesOnChain = await getRoles(wallet, institutionId);

    const roles = [
      ...(isAdmin ? ["ADMIN"] : []),
      ...(isOperatorByENS ? ["OPERATOR"] : []),
      ...rolesOnChain
    ];

    const uniqueRoles = [...new Set(roles)];

    if (uniqueRoles.length === 0) {
      return res.status(403).json({ error: "Sem permissões" });
    }

  
    return res.json({
      wallet,
      ens,
      dominio: dominioPrincipal,
      institutionId,
      instituicao,

      roles: uniqueRoles,

      isAdmin: uniqueRoles.includes("ADMIN"),
      isOperator: uniqueRoles.includes("OPERATOR"),
      isValidator: uniqueRoles.includes("VALIDATOR"),
      isSuperAdmin: uniqueRoles.includes("PLATFORM_ADMIN")
    });

  } catch (err) {
    console.error("loginENS error:", err);
    return res.status(500).json({ error: "Erro login ENS" });
  }
};

module.exports = { loginENS, getNonce };