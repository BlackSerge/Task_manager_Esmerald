export const audioService = {
  playSuccess(): void {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3");
    audio.volume = 0.4;
    audio.play().catch(err => console.log("Audio play blocked", err));
  }
};