import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Faz a autenticação direto no Firebase
      await signInWithEmailAndPassword(auth, email, senha);
      // Se der certo, joga você para o painel admin
      navigate("/admin");
    } catch (error) {
      console.error(error);
      setErro("Credenciais inválidas. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col justify-center items-center px-4 font-sans">
      <div className="w-full max-w-md bg-[#141414] border border-[#00e5ff]/20 p-8 rounded-2xl shadow-[0_0_30px_rgba(0,229,255,0.05)] space-y-6">
        {/* LOGO / TÍTULO */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black tracking-wider text-[#00e5ff]">
            DVD<span className="text-[#00ff66]">COMPUTER</span>
          </h1>
          <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Acesso Restrito ao Administrador
          </p>
        </div>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono p-3 rounded-lg text-center">
            {erro}
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 uppercase">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@dvdcomputer.com"
              className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff66] transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 uppercase">
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff66] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#00ff66] text-black font-bold text-sm py-3.5 rounded-xl hover:bg-[#00cc55] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider mt-2"
          >
            {carregando ? "Autenticando..." : "Entrar no Painel"}
          </button>
        </form>
      </div>
    </div>
  );
}
