import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./config/firebase";

// Importação das páginas que vamos criar a seguir
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

// Componente de Proteção de Rota (Segurança)
// Ele impede que qualquer pessoa acesse o /admin sem estar logado
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center font-mono text-[#00ff66]">
        CARREGANDO SISTEMA...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Pública: O que o cliente vê */}
        <Route path="/" element={<Home />} />

        {/* Rota de Login: Onde você faz a autenticação */}
        <Route path="/login" element={<Login />} />

        {/* Rota Protegida: O painel de administração da DVD Computer */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
