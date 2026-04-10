export async function getAxolote(id){
    const response = await fetch(`https://axolove-deploy-1004.onrender.com/registros/axolote/${id}/historico`);

    if(!response.ok){
        throw new Error ("Erro ao buscar histórico");
    }

    return response.json();
}