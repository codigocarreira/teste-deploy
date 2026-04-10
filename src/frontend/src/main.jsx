import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { WalletProvider } from "../context/WalletContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <WalletProvider>
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </WalletProvider>,
);
