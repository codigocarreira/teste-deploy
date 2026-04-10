import react from "react";
import Header from "../components/layout/Header";
import "../styles/acessoNegado.css"

function AcessoNegado(){
    return(
        <section>
            <Header/>
            <section className="container_section">
                <div className="container">
                    <h1>Acceso denegado</h1>
                    <h3>No tienes acceso a esta pantalla. Inicia sesión con MetaMask</h3>
                </div>
            </section>
        </section>
       
    )
}

export default AcessoNegado;