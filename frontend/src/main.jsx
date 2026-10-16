import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CreditsProvider } from "./context/CreditsContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <CreditsProvider>
        <App />
      </CreditsProvider>
    </AuthProvider>
  </BrowserRouter>
);