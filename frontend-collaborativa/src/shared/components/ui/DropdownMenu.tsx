// src/shared/components/ui/DropdownMenu.tsx
import React, { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

export interface DropdownOption {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "danger" | "default";
  requiresConfirmation?: boolean;
  confirmationConfig?: {
    title: string;
    description: string;
    confirmText?: string;
  };
}

interface Props {
  options: DropdownOption[];
  triggerClassName?: string;
}

export const DropdownMenu: React.FC<Props> = ({ options, triggerClassName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOption, setPendingOption] = useState<DropdownOption | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOptionClick = (opt: DropdownOption) => {
    if (opt.requiresConfirmation) {
      setPendingOption(opt);
      setShowConfirm(true);
      setIsOpen(false);
    } else {
      opt.onClick();
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          className={`p-2 rounded-full transition-all active:scale-90 ${triggerClassName}`}
        >
          <MoreVertical size={20} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-emerald-100 rounded-2xl shadow-2xl py-2 z-[110] animate-in fade-in zoom-in duration-200">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); handleOptionClick(opt); }}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 font-bold transition-colors
                  ${opt.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-emerald-800 hover:bg-emerald-50"}`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Renderizado fuera del flujo del menú para opacidad total */}
      {pendingOption && showConfirm && (
        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => {
            setShowConfirm(false);
            setPendingOption(null);
          }}
          onConfirm={() => {
            pendingOption.onClick();
            setShowConfirm(false);
            setPendingOption(null);
          }}
          title={pendingOption.confirmationConfig?.title || "¿Estás seguro?"}
          description={pendingOption.confirmationConfig?.description || "Esta acción no se puede deshacer."}
          confirmText={pendingOption.confirmationConfig?.confirmText}
          variant={pendingOption.variant === "danger" ? "danger" : "primary"}
        />
      )}
    </>
  );
};