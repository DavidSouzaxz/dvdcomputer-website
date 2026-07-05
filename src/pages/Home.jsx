import React, { useState, useEffect } from "react";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Altere aqui para o seu número real do WhatsApp da DVD Computer
  //   const whatsappLink =
  //     "https://wa.me/5585999999999?text=Olá!+Vim+pelo+site+da+DVD+Computer+e+gostaria+de+agendar+um+serviço.";
  const instagramLink = "https://ig.me/m/dvdcomputer";

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "itens"));
        const lista = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItens(lista);
      } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
      } finally {
        setCarregando(false);
      }
    };

    buscarDados();
  }, []);

  // Separa os itens vindos do banco por categorias
  const servicos = itens.filter((item) => item.tipo === "servico");
  const produtos = itens.filter((item) => item.tipo === "produto");

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans selection:bg-[#00ff66] selection:text-black">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/90 backdrop-blur-md border-b border-[#00e5ff]/20 p-4 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-wider text-[#00e5ff]">
          DVD<span className="text-[#00ff66]">COMPUTER</span>
        </h1>
        <a
          href={instagramLink}
          target="_blank"
          rel="noreferrer"
          className="bg-[#00ff66] text-black font-bold px-4 py-2 rounded-md text-sm hover:bg-[#00cc55] transition-all"
        >
          Agendar
        </a>
      </header>

      {/* CONTEÚDO PRINCIPAL (MOBILE FIRST) */}
      <main className="max-w-md mx-auto px-4 py-8 space-y-12 pb-24 md:max-w-2xl">
        {/* HERO SECTION */}
        <section className="text-center space-y-4">
          <div className="inline-block border border-[#00ff66]/30 bg-[#00ff66]/10 text-[#00ff66] text-xs font-mono px-3 py-1 rounded-full">
            CENTRAL DE REPAROS CIBERNÉTICOS
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Especialistas em montagem, manutenção e otimização de computadores e
            notebooks de alta performance.
          </p>
        </section>

        {carregando ? (
          <div className="text-center font-mono text-xs text-[#00e5ff] py-12 animate-pulse">
            SINCROZINANDO COM A CENTRAL...
          </div>
        ) : (
          <>
            {/* SEÇÃO: CATÁLOGO DE PREÇOS */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#00e5ff] flex items-center gap-2 font-mono">
                <span>&gt;</span> Catálogo de Serviços
              </h2>
              <div className="space-y-3">
                {servicos.length === 0 ? (
                  <p className="text-xs text-gray-600 font-mono italic">
                    Nenhum serviço disponível no momento.
                  </p>
                ) : (
                  servicos.map((svc) => (
                    <div
                      key={svc.id}
                      className="bg-[#141414] border border-gray-800 p-4 rounded-xl flex justify-between items-center active:border-[#00ff66]/50 transition-all"
                    >
                      <div>
                        <h3 className="font-semibold text-white text-sm">
                          {svc.nome}
                        </h3>
                        {svc.obs && (
                          <p className="text-xs text-gray-500">{svc.obs}</p>
                        )}
                      </div>
                      <span className="text-[#00ff66] font-mono font-bold text-sm bg-[#00ff66]/5 px-2 py-1 rounded border border-[#00ff66]/10 h-fit whitespace-nowrap">
                        {svc.preco}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* SEÇÃO: PRODUTOS */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-[#00e5ff] flex items-center gap-2 font-mono">
                <span>&gt;</span> Hardware & Upgrades
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {produtos.length === 0 ? (
                  <p className="text-xs text-gray-600 font-mono italic col-span-full">
                    Nenhum componente em estoque hoje.
                  </p>
                ) : (
                  produtos.map((prod) => (
                    <div
                      key={prod.id}
                      className="bg-[#141414] border border-gray-800 p-4 rounded-xl flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        {prod.imagemUrl && (
                          <img
                            src={prod.imagemUrl}
                            alt={prod.nome}
                            className="w-full h-36 object-cover rounded-lg border border-gray-800"
                          />
                        )}
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-semibold text-white text-sm leading-tight">
                            {prod.nome}
                          </h3>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border flex-shrink-0 ${prod.estoque > 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}
                          >
                            {prod.estoque > 0
                              ? `Estoque: ${prod.estoque}`
                              : "Esgotado"}
                          </span>
                        </div>
                        {prod.descricao && (
                          <p className="text-xs text-gray-400 leading-normal font-sans pt-1 border-t border-gray-800/50">
                            {prod.descricao}
                          </p>
                        )}
                      </div>
                      <span className="text-[#00ff66] font-mono font-bold text-sm bg-[#00ff66]/5 px-2 py-1 rounded border border-[#00ff66]/10 w-fit">
                        {prod.preco}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {/* SOBRE & LOCALIZAÇÃO */}
        <section className="bg-[#141414] border border-gray-800 p-5 rounded-xl space-y-3 font-mono text-xs">
          <div className="flex gap-1 items-baseline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-[#00ff66]"
            >
              <path
                fillRule="evenodd"
                d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742c1.004-.717 2.176-1.655 3.187-2.775C18.825 16.751 20 14.425 20 11.5c0-4.646-3.643-8.5-8-8.5s-8 3.854-8 8.5c0 2.925 1.175 5.251 2.208 6.304 1.01 1.12 2.182 2.058 3.187 2.775a16.974 16.974 0 001.145.742zM12 13.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-sm font-bold text-white capitalize tracking-wider">
              Nossa Localização
            </h2>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Maranguape, Rua Macário Pontes,
            <br />
            Novo Maranguape I, 409B.
          </p>
          <div className="pt-2 text-gray-500 text-[10px]">
            * Traga sua máquina para uma avaliação técnica detalhada na nossa
            bancada.
          </div>
        </section>
      </main>

      {/* BOTÃO FLUTUANTE WHATSAPP (ACESSIBILIDADE MOBILE) */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href={instagramLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-[#00ff66] text-black rounded-full shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:scale-110 active:scale-95 transition-all"
          aria-label="Fale Conosco no WhatsApp"
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.847.001-2.633-1.025-5.107-2.892-6.974C16.516 1.916 14.045.89 11.41.889c-5.438 0-9.863 4.414-9.865 9.849-.001 1.762.461 3.483 1.337 5.016l-1.005 3.675 3.771-.989z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
