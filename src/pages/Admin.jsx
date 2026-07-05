import React, { useState, useEffect } from "react";
import { db, auth } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [obs, setObs] = useState("");
  const [estoque, setEstoque] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [tipo, setTipo] = useState("servico"); // 'servico' ou 'produto'
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [idEdicao, setIdEdicao] = useState(null);

  const navigate = useNavigate();
  const itensCollectionRef = collection(db, "itens");

  const handlePrecoChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (!valor) {
      setPreco("");
      return;
    }
    valor = (Number(valor) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setPreco(valor);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      setImagemUrl(data.secure_url);
    } catch (err) {
      console.error("Erro no upload do Cloudinary:", err);
      alert("Falha ao carregar imagem.");
    } finally {
      setUploadingImg(false);
    }
  };

  // Função para buscar os itens salvos no banco
  const buscarItens = async () => {
    try {
      const data = await getDocs(itensCollectionRef);
      setItens(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
    }
  };

  useEffect(() => {
    buscarItens();
  }, []);

  // Salvar novo item no banco
  const handleSalvar = async (e) => {
    e.preventDefault();
    setCarregando(true);

    const dadosItem = {
      nome,
      preco,
      tipo,
      imagemUrl,
      obs: tipo === "servico" ? obs : "",
      estoque: tipo === "produto" ? Number(estoque) : 0,
      descricao: tipo === "produto" ? descricao : "",
    };

    try {
      if (idEdicao) {
        // Modo Edição
        const itemDoc = doc(db, "itens", idEdicao);
        await updateDoc(itemDoc, dadosItem);
        setIdEdicao(null);
      } else {
        // Modo Novo Cadastro
        await addDoc(itensCollectionRef, dadosItem);
      }

      // Reset de campos
      setNome("");
      setPreco("");
      setObs("");
      setEstoque("");
      setDescricao("");
      setImagemUrl("");
      buscarItens();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    } finally {
      setCarregando(false);
    }
  };

  const iniciarEdicao = (item) => {
    setIdEdicao(item.id);
    setTipo(item.tipo);
    setNome(item.nome);
    setPreco(item.preco);
    setImagemUrl(item.imagemUrl || "");
    if (item.tipo === "servico") {
      setObs(item.obs || "");
    } else {
      setEstoque(item.estoque || "");
      setDescricao(item.descricao || "");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelaEdicao = () => {
    setIdEdicao(null);
    setNome("");
    setPreco("");
    setObs("");
    setEstoque("");
    setDescricao("");
    setImagemUrl("");
  };

  // Deletar item do banco
  const handleDeletar = async (id) => {
    if (window.confirm("Deseja mesmo excluir este item?")) {
      try {
        const itemDoc = doc(db, "itens", id);
        await deleteDoc(itemDoc);
        buscarItens();
      } catch (error) {
        console.error("Erro ao deletar:", error);
      }
    }
  };

  // Função para deslogar de forma segura
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans pb-12">
      <header className="bg-[#141414] border-b border-gray-800 p-4 flex justify-between items-center max-w-4xl mx-auto mt-0 md:mt-4 md:rounded-xl">
        <div>
          <h1 className="text-md font-bold text-[#00e5ff]">PAINEL ADMIN</h1>
          <p className="text-xs text-gray-500 font-mono">DVD COMPUTER</p>
        </div>
        <button
          onClick={() => signOut(auth).then(() => navigate("/login"))}
          className="text-xs font-mono text-red-400 border border-red-500/20 bg-red-500/5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
        >
          Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* FORMULÁRIO */}
        <section className="bg-[#141414] border border-gray-800 p-5 rounded-2xl h-fit space-y-4">
          <h2 className="text-sm font-bold font-mono text-[#00ff66] uppercase tracking-wider">
            {idEdicao ? "> Editando Item" : "> Novo Registro"}
          </h2>

          <form onSubmit={handleSalvar} className="space-y-3 text-xs">
            {!idEdicao && (
              <div className="flex gap-2 bg-[#0d0d0d] p-1 rounded-xl border border-gray-800">
                <button
                  type="button"
                  onClick={() => setTipo("servico")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all ${tipo === "servico" ? "bg-[#00ff66] text-black" : "text-gray-400"}`}
                >
                  Serviço
                </button>
                <button
                  type="button"
                  onClick={() => setTipo("produto")}
                  className={`flex-1 py-2 font-bold rounded-lg transition-all ${tipo === "produto" ? "bg-[#00ff66] text-black" : "text-gray-400"}`}
                >
                  Produto
                </button>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-gray-400 font-mono uppercase">Nome</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Montagem Completa"
                className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-400 font-mono uppercase">Preço</label>
              <input
                type="text"
                required
                value={preco}
                onChange={handlePrecoChange}
                placeholder="R$ 0,00"
                className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#00e5ff]"
              />
            </div>

            {/* CAMPOS DINÂMICOS DE SERVIÇO */}
            {tipo === "servico" && (
              <div className="space-y-1">
                <label className="text-gray-400 font-mono uppercase">
                  Observação curta
                </label>
                <input
                  type="text"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Ex: Troca de pasta térmica inclusa"
                  className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00e5ff]"
                />
              </div>
            )}

            {/* CAMPOS DINÂMICOS DE PRODUTO */}
            {tipo === "produto" && (
              <>
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono uppercase">
                    Estoque (Qtd)
                  </label>
                  <input
                    type="number"
                    required
                    value={estoque}
                    onChange={(e) => setEstoque(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00e5ff]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-400 font-mono uppercase">
                    Descrição do Produto
                  </label>
                  <textarea
                    rows="3"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Especificações técnicas detalhadas..."
                    className="w-full bg-[#0d0d0d] border border-gray-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#00e5ff] resize-none"
                  />
                </div>
              </>
            )}

            {/* UPLOAD CLOUDINARY */}
            <div className="space-y-1 pt-1">
              <label className="text-gray-400 font-mono uppercase block">
                Imagem do Item
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer w-full"
              />
              {uploadingImg && (
                <p className="text-[#00e5ff] text-[10px] animate-pulse">
                  Enviando imagem ao satélite...
                </p>
              )}
              {imagemUrl && (
                <img
                  src={imagemUrl}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl mt-2 border border-gray-700"
                />
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {idEdicao && (
                <button
                  type="button"
                  onClick={cancelaEdicao}
                  className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-all uppercase tracking-wider"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={carregando || uploadingImg}
                className="flex-1 bg-[#00e5ff] text-black font-bold py-3 rounded-xl hover:bg-[#00ccff] transition-all uppercase tracking-wider"
              >
                {carregando ? "Salvando..." : idEdicao ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </form>
        </section>

        {/* LISTAGEM */}
        <section className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold font-mono text-[#00e5ff] uppercase tracking-wider">
            &gt; Inventário Ativo ({itens.length})
          </h2>
          <div className="space-y-2">
            {itens.map((item) => (
              <div
                key={item.id}
                className="bg-[#141414] border border-gray-800 p-4 rounded-xl flex justify-between items-center text-sm gap-2"
              >
                <div className="flex items-center gap-3">
                  {item.imagemUrl && (
                    <img
                      src={item.imagemUrl}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg border border-gray-800 flex-shrink-0"
                    />
                  )}
                  <div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mr-2 border ${item.tipo === "servico" ? "border-[#00ff66]/20 bg-[#00ff66]/5 text-[#00ff66]" : "border-[#00e5ff]/20 bg-[#00e5ff]/5 text-[#00e5ff]"}`}
                    >
                      {item.tipo === "produto"
                        ? `QTD: ${item.estoque}`
                        : "SERVIÇO"}
                    </span>
                    <h3 className="font-semibold text-white inline">
                      {item.nome}
                    </h3>
                    {item.tipo === "produto" && item.descricao && (
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {item.descricao}
                      </p>
                    )}
                    {item.tipo === "servico" && item.obs && (
                      <p className="text-xs text-gray-500">{item.obs}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-white text-xs bg-black/40 px-2 py-1 rounded border border-gray-800 whitespace-nowrap">
                    {item.preco}
                  </span>
                  <button
                    onClick={() => iniciarEdicao(item)}
                    className="text-gray-400 hover:text-[#00e5ff] p-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeletar(item.id)}
                    className="text-red-500 hover:text-red-400 p-1 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
