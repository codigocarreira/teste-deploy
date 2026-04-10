import { grantRole } from "./accessService";

export async function addUser({ name, wallet, role, institutionId }) {
  const res = await fetch("http://localhost:3000/usuarios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      wallet,
      role,
      institutionId
    })
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Resposta inválida do servidor");
  }

  if (!res.ok) {
    throw new Error(data.error || "Erro ao salvar usuário");
  }

  try {
    await grantRole(institutionId, wallet, role);
  } catch (err) {
    console.warn("Usuário salvo, mas NÃO registrado on-chain ainda");
    console.warn(err.reason || err.message);
  }

  return data;
}
