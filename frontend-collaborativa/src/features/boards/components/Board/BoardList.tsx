import React from "react";
import { Link } from "react-router-dom";
import { useBoards } from "../../hooks/useBoards";
import { CreateBoardForm } from "./CreateBoardForm";
import { Layout, Calendar, Clock, ChevronRight, Loader2 } from "lucide-react";
import { Board } from "../../types";

export const BoardList: React.FC = () => {
  const { data: boards, isLoading, isError } = useBoards();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-emerald-900/40 font-black uppercase tracking-widest text-xs">
          Cargando tus proyectos...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 text-center">
        <p className="text-red-600 font-bold">Error al cargar los tableros. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header & Create Form */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-emerald-900/5 p-8 rounded-[3rem] border border-emerald-100/50">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-emerald-950 tracking-tight">
            Mis Tableros
          </h2>
          <p className="text-emerald-600/60 font-medium">
            Gestiona tus portafolios y proyectos en tiempo real.
          </p>
        </div>
        <CreateBoardForm />
      </section>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {boards?.map((board: Board) => (
          <Link
            key={board.id}
            to={`/boards/${board.id}`}
            className="group relative bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-xl shadow-emerald-900/5 hover:shadow-emerald-900/10 hover:border-emerald-200 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Layout size={24} />
                </div>
                <div className="flex gap-2">
                   <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {board.columns?.length || 0} Listas
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-black text-emerald-950 group-hover:text-emerald-600 transition-colors mb-2">
                {board.title}
              </h3>
              
              <div className="flex items-center gap-4 text-emerald-900/40 mt-4">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-tight">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-tight">
                    Reciente
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">
                Abrir Tablero
              </span>
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:translate-x-1 transition-transform">
                <ChevronRight size={18} />
              </div>
            </div>
          </Link>
        ))}

        {/* Empty State placeholder if no boards */}
        {boards?.length === 0 && (
          <div className="col-span-full py-20 border-4 border-dashed border-emerald-50 rounded-[3rem] flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-50 p-6 rounded-full text-emerald-200 mb-4">
              <Layout size={48} />
            </div>
            <h3 className="text-emerald-900/40 font-black uppercase tracking-[0.3em] text-sm">
              No hay tableros todavía
            </h3>
            <p className="text-emerald-600/40 font-medium text-sm mt-2">
              Empieza creando tu primer portafolio arriba.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};