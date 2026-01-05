// src/shared/components/dnd/DroppableWrapper.tsx
import { Droppable, DroppableProps } from "@hello-pangea/dnd";
import React, { useEffect, useState } from "react";

// Omitimos droppableId de las props originales para manejarlo nosotros con el nombre "id"
interface Props extends Omit<DroppableProps, "children" | "droppableId"> {
  id: string | number;
  children: React.ReactNode;
  className?: string;
}

export const DroppableWrapper: React.FC<Props> = ({ 
  id, 
  children, 
  className, 
  ...props 
}) => {
  // Fix para evitar errores de hidratación en React 18/Next
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));
    return () => cancelAnimationFrame(animation);
  }, []);

  if (!enabled) return null;

  return (
    <Droppable droppableId={id.toString()} {...props}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`${className} transition-colors duration-300 ${
            snapshot.isDraggingOver ? "bg-emerald-100/20" : ""
          }`}
        >
          {children}
          
          {/* 💡 Este es el "Hueco" (Placeholder) visible y elegante */}
          {provided.placeholder && (
            <div className="relative pointer-events-none">
              {/* Renderizamos el placeholder original para que el motor de DnD calcule el espacio */}
              {provided.placeholder}
              {/* Superponemos nuestro diseño Premium de hueco */}
              <div className="absolute inset-0 mt-4 rounded-[2rem] border-2 border-dashed border-emerald-200/50 bg-emerald-50/30 animate-pulse" />
            </div>
          )}
        </div>
      )}
    </Droppable>
  );
};