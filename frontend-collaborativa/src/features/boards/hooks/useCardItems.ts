// src/features/boards/hooks/useCardItems.ts
import { useState } from "react";
import { Card,PriorityLevel } from "../types/board.types";

export const useCardItem = (card: Card, onUpdate?: (payload: Partial<Card>) => void) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate?.({ is_completed: !card.is_completed });
  };

  const handleUpdateTitle = (title: string) => {
    onUpdate?.({ title });
    setIsEditingTitle(false);
  };

  const handleUpdateDescription = (description: string) => {
    onUpdate?.({ description });
    setIsEditingDesc(false);
  };

  const handleUpdatePriority = (priority: PriorityLevel) => {
    onUpdate?.({ priority });
  };

  return {
    isEditingTitle,
    setIsEditingTitle,
    isEditingDesc,
    setIsEditingDesc,
    handleToggleComplete,
    handleUpdateTitle,
    handleUpdateDescription,
    handleUpdatePriority,
  };
};