// src/features/chat/components/ChatPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { Send, Hash, Loader2 } from "lucide-react";

interface Props {
  boardId: string;
}

export const ChatPanel: React.FC<Props> = ({ boardId }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { 
    messages, 
    initChat, 
    disconnect, 
    sendMessage, 
    isConnected, 
    isLoading 
  } = useChatStore();

  useEffect(() => {
    initChat(boardId);
    return () => disconnect();
  }, [boardId, initChat, disconnect]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    sendMessage(inputText);
    setInputText("");
  };

  return (
    /* CAMBIOS CLAVE:
       - Eliminado w-80 (ahora es w-full para llenar el aside)
       - Eliminado h-[88vh] (ahora h-full para llenar el aside)
       - Eliminado rounded-[2.5rem] (el recorte lo hace el aside)
       - bg-white puro para que no se vea el fondo de atrás
    */
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      
      {/* Header - Ajustado para que la curva del aside no corte el texto */}
      <div className="pt-10 pb-6 px-10 border-b border-emerald-50 bg-emerald-50/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-emerald-600" />
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-900">
            Discusión
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
            {isConnected ? "En línea" : "Offline"}
          </span>
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-400'}`} />
        </div>
      </div>

      {/* Área de Mensajes - Padding lateral aumentado para que respire */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 custom-scrollbar bg-white">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 opacity-40">
            <Loader2 className="animate-spin text-emerald-600" size={24} />
            <span className="text-[11px] font-black uppercase tracking-widest">Sincronizando...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-10 opacity-30">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
               <Hash size={30} className="text-emerald-200" />
            </div>
            <p className="text-xs font-bold uppercase tracking-tighter leading-tight">No hay mensajes en este tablero</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={`${msg.id}-${msg.created_at}`} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                  {msg.username}
                </span>
                <span className="text-[9px] text-slate-400 font-bold">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-3xl rounded-tl-none border border-emerald-100/50 text-sm leading-relaxed text-emerald-950 shadow-sm">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario de envío - Pegado abajo y con padding extra */}
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-emerald-50 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isConnected ? "Escribe un mensaje..." : "Reconectando..."}
            disabled={!isConnected || isLoading}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-0 outline-none transition-all placeholder:text-slate-400 disabled:opacity-50 font-medium"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || !isConnected || isLoading}
            className="absolute right-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-slate-200 transition-all shadow-md shadow-emerald-200 active:scale-90"
          >
            <Send size={16} strokeWidth={3} />
          </button>
        </div>
      </form>
    </div>
  );
};