document.addEventListener("DOMContentLoaded", () => {
  // Create audio element
  const bgMusic = new Audio("./music/batb.mp3");
  bgMusic.loop = true;          // Loop endlessly
  bgMusic.volume = 0.5;         // Adjust volume (0.0 – 1.0)
  
  // Try to auto-play (browsers sometimes block autoplay without interaction)
  const tryPlay = () => {
    bgMusic.play().catch(() => {
      console.warn("Autoplay blocked by browser. Will retry on first user interaction.");
      document.addEventListener("click", () => {
        bgMusic.play();
      }, { once: true });
    });
  };

  tryPlay();
});
