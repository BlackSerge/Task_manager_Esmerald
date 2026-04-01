import { useState, useEffect } from "react";

export const useTimeTick = (intervalMs: number = 1000) => { // 1 segundo
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return tick;
};