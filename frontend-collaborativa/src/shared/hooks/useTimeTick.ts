// src/shared/hooks/useTimeTick.ts
import { useState, useEffect } from "react";

/**
 * Hook que proporciona un valor incremental basado en un intervalo.
 * Utilizado para forzar re-renderizados en componentes que dependen del paso del tiempo.
 */
// src/shared/hooks/useTimeTick.ts
export const useTimeTick = (intervalMs: number = 1000) => { // 1 segundo
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
};