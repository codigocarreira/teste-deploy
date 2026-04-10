import { Routes, Route, Link } from "react-router-dom";
import CadastroUsuario from "./pages/CadastroUsuario.jsx";
import SuperAdminPanel from "./pages/SuperAdmin.jsx";
import LoginAdmin from "./pages/LoginAdmin.jsx";
import LoginOperador from "./pages/LoginOperador.jsx";
import LoginAuditor from "./pages/LoginAuditor.jsx";
import InserirAquario from "./pages/InserirAquario.jsx";
import InserirAxolote from "./pages/InserirAxolote.jsx";
import PainelOperador from "./pages/PainelOperador.jsx";
import OperadorRoute from "./routes/OperadorRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import AuditorRoute from "./routes/AuditorRoute.jsx";
import AcessoNegado from "./pages/AcessoNegado.jsx";
import Home from "./pages/Home.jsx";
import RegistroAxolote from "./pages/RegistroAxolote.jsx";
import RegistroAquario from "./pages/RegistroAquario.jsx";
import AxoloteDetails from "./pages/AxoloteDetails.jsx";
import AquarioDetails from "./pages/AquarioDetails.jsx";
import PainelValidador from "./pages/PainelValidador.jsx";
import LoginENS from "./pages/LoginENS.jsx";
import CriarInstituicao from "./pages/CriarInstituicao.jsx";
import SolicitarAcesso from "./pages/SolicitarAcesso.jsx";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastrarUsuario" element={<CadastroUsuario />} />
        <Route path="/solicitarAcesso" element={<SolicitarAcesso/>} />
        <Route path="/superAdmin" element={<SuperAdminPanel />} />
        <Route path="/loginAdmin" element={<LoginAdmin />} />
        <Route path="/loginOperador" element={<LoginOperador />} />
        <Route path="/loginAuditor" element={<LoginAuditor />} />
        <Route path="/axolote/:specimenId" element={<AxoloteDetails />} />
        <Route path="/tank/:tankId" element={<AquarioDetails />} />
        <Route path="/painelValidador" element={<PainelValidador />} />
        <Route path="/login" element={<LoginENS />} />
        <Route path="/criarInstituicao" element={<CriarInstituicao />} />
        <Route
          path="/registro-axolote"
          element={
            <OperadorRoute>
              <RegistroAxolote />
            </OperadorRoute>
          }
        />
        <Route
          path="/registro-aquario"
          element={
            <OperadorRoute>
              {" "}
              <RegistroAquario />{" "}
            </OperadorRoute>
          }
        />
        <Route
          path="/painelAdmin"
          element={
            
              <CadastroUsuario />
          
          }
        />
        <Route
          path="/adicionarPecera"
          element={
            <OperadorRoute>
              <InserirAquario />
            </OperadorRoute>
          }
        />
        <Route
          path="/adicionarAjolote"
          element={
            <OperadorRoute>
              <InserirAxolote />
            </OperadorRoute>
          }
        />
        <Route
          path="/painelOperador"
          element={
            <OperadorRoute>
              <PainelOperador />
            </OperadorRoute>
          }
        />
        <Route path="/acessoDenegado" element={<AcessoNegado />} />
      </Routes>
    </div>
  );
}
