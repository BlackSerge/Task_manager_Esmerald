// src/shared/services/confetti.service.ts
import confetti from 'canvas-confetti';
import { audioService } from './audio.service';

export const confettiService = {
  fireSuccess(): void {
    audioService.playSuccess();
    const duration = 3 * 1000; // 3 segundos
    const animationEnd = Date.now() + duration;
    
    // 💡 Subimos el zIndex a 9999 para que siempre sea visible sobre el board
    const defaults: confetti.Options = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999 
    };

    const randomInRange = (min: number, max: number): number => 
      Math.random() * (max - min) + min;

    // 💡 Tipamos el intervalo como ReturnType<typeof setInterval> para evitar 'any' o 'number'
    const interval: ReturnType<typeof setInterval> = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Lanzamiento desde la izquierda
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#34d399', '#a7f3d0']
      });

      // Lanzamiento desde la derecha
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#059669', '#10b981', '#ffffff']
      });
    }, 250);
  }
};