const { ethers } = require("ethers");

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

const abi = [
  "function owner(bytes32 node) view returns (address)"
];

async function getENSOwner(nome) {
  try {
    const registry = new ethers.Contract(ENS_REGISTRY, abi, provider);
    const node = ethers.namehash(nome);
    const owner = await registry.owner(node);
    if (owner === ethers.ZeroAddress) return null;

    const network = await provider.getNetwork();
    console.log("NETWORK:", network);
    return owner.toLowerCase();

  } catch (err) {
    console.error("ENS error:", err);
    return null;
  }
}

module.exports = { getENSOwner };