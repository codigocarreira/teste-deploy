import { ethers } from "ethers";
import { USER_ACCESS, USER_ACCESS_ABI } from "../config/contracts";

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask não encontrada");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(USER_ACCESS, USER_ACCESS_ABI, signer);
}

export async function registerAccess(labelhash, parentNode) {
  const contract = await getContract();

  const tx = await contract.registerAccess(labelhash, parentNode);
  await tx.wait();
}
export async function grantRole(institutionId, wallet, role) {
  const contract = await getContract();

  let tx;

  if (role === "ADMIN") {
    tx = await contract.grantAdmin(institutionId, wallet);
  } else if (role === "OPERATOR") {
    tx = await contract.grantOperator(institutionId, wallet);
  } else if (role === "VALIDATOR") {
    tx = await contract.grantValidator(institutionId, wallet);
  } else {
    throw new Error("Role inválida");
  }

  await tx.wait();
}
