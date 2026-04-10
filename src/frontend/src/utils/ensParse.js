export const getParentENS = (ens) => {
  if (!ens) return null;

  const parts = ens.split(".");

  if (parts.length < 3) {
    console.error("ENS inválido:", ens);
    return null;
  }

  parts.shift(); 

  const parent = parts.join(".");

  console.log("ENS instituição (extraído):", parent);

  return parent;
};