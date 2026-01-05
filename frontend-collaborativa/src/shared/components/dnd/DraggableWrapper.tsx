// src/shared/components/dnd/DraggableWrapper.tsx
import { Draggable, DraggableProvided } from "@hello-pangea/dnd";
import React from "react";
import { createPortal } from "react-dom";

interface Props {
  id: string | number;
  index: number;
  children: (isDragging: boolean, provided: DraggableProvided) => React.ReactNode;
}

// 💡 Elemento donde teletransportaremos la tarjeta al arrastrar
const portalElement = document.getElementById("draggable-portal") || document.body;

export const DraggableWrapper: React.FC<Props> = ({ id, index, children }) => {
  return (
    <Draggable draggableId={id.toString()} index={index}>
      {(provided, snapshot) => {
        const style = {
          ...provided.draggableProps.style,
          // 💡 Eliminamos el lag del ratón totalmente
          transition: snapshot.isDragging 
            ? "transform 0.05s cubic-bezier(0.2, 0, 0, 1)" 
            : provided.draggableProps.style?.transition,
        };

        const content = (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={style}
            className={`outline-none ${snapshot.isDragging ? "z-[9999] pointer-events-none" : ""}`}
          >
            {children(snapshot.isDragging, provided)}
          </div>
        );

        // 💡 Si está arrastrando, lo enviamos al Portal para que sea siempre visible
        if (snapshot.isDragging) {
          return createPortal(content, portalElement);
        }

        return content;
      }}
    </Draggable>
  );
};