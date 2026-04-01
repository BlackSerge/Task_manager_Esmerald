import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "@/features/auth";
import { Send, Hash, Loader2 } from "lucide-react";

interface Props {
  boardId: string;
}

export const ChatPanel: React.FC<Props> = ({ boardId }) => {
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentUser = useAuthStore((state) => state.user);
  const { messages, initChat, disconnect, sendMessage, isConnected, isLoading } = useChatStore();

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
    <div className="w-full h-full flex flex-col bg-white overflow-hidden border-l border-emerald-50">
      
      {/* Header */}
      <header className="pt-10 pb-6 px-10 border-b border-emerald-100/50 bg-emerald-50/20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Hash size={18} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-950">Discusión</h3>
            <p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-widest">Proyecto Activo</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-[10px] font-black uppercase text-emerald-900/40 tracking-widest">
            {isConnected ? "En Vivo" : "Offline"}
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar bg-slate-50/20"
      >
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <Loader2 className="animate-spin text-emerald-600" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.username === currentUser?.username;
            
            return (
              <div 
                key={`${msg.id}-${index}`} 
                className={`flex flex-col w-full animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Nombre y Hora */}
                <div className={`flex items-center gap-2 mb-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${
                    isMe ? 'text-emerald-600' : 'text-emerald-800'
                  }`}>
                    {isMe ? "Tú" : msg.username}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Burbuja  */}
                <div className={`
                  relative max-w-[85%] p-4 px-5 text-[14px] leading-relaxed shadow-sm transition-all
                  ${isMe 
                    ? 'bg-emerald-100 text-emerald-900 rounded-2xl rounded-tr-none border border-emerald-200' 
                    : 'bg-emerald-600 text-white rounded-2xl rounded-tl-none shadow-md shadow-emerald-200/50'
                  }
                `}>
                  
                  <span className="block break-words">
                    {msg.content}
                  </span>
                  
                  <div className={`absolute top-0 w-3 h-3 ${
                    isMe 
                    ? '-right-[5px] bg-emerald-100 [clip-path:polygon(0_0,0_100%,100%_0)] border-r border-emerald-200' 
                    : '-left-[5px] bg-emerald-600 [clip-path:polygon(0_0,100%_100%,100%_0)]'
                  }`} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <footer className="p-6 bg-white border-t border-emerald-100/50">
        <form onSubmit={handleSend} className="relative flex items-center bg-slate-100 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="w-full bg-transparent py-3.5 pl-5 pr-14 text-sm outline-none font-medium text-slate-800"
          />
          <button 
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="absolute right-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-30"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </form>
      </footer>
    </div>
  );
};

const EmptyChatState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
    <Hash size={32} className="text-emerald-200 mb-4" />
    <p className="text-xs font-black uppercase tracking-widest">Sin mensajes aún</p>
  </div>
);