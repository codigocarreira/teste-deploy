export async function getAxolote(id){
    const response = await fetch(`http://localhost:3000/registros/axolote/${id}/historico`);

    if(!response.ok){
        throw new Error ("Erro ao buscar histórico");
    }

    return response.json();
}