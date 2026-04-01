import React, { useState, useEffect } from "react";

export interface EditableTitleProps {
  initialValue: string;
  onSave: (newValue: string) => void;
  className?: string;
  inputClassName?: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({ 
  initialValue, 
  onSave, 
  className = "", 
  inputClassName = "" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    setIsEditing(false);
    if (value.trim() && value !== initialValue) {
      onSave(value.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleBlur();
    if (e.key === "Escape") {
      setIsEditing(false);
      setValue(initialValue);
    }
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-white border-2 border-emerald-500 rounded px-1 outline-none ${inputClassName}`}
      />
    );
  }

  return (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }} 
      className={`cursor-pointer hover:bg-black/5 rounded px-1 transition-colors ${className}`}
    >
      {initialValue}
    </span>
  );
};