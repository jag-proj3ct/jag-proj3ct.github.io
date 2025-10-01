document.addEventListener("DOMContentLoaded", () => {
  // Create audio element
  const bgMusic = new Audio("./music/batb.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  // --- Visualizer Setup ---
  const strokes = document.querySelectorAll("#wave .stroke");

  // Create audio context + analyser
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64; // fewer bars, smoother
  const source = audioCtx.createMediaElementSource(bgMusic);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function animate() {
    requestAnimationFrame(animate);
    analyser.getByteFrequencyData(dataArray);

    strokes.forEach((stroke, i) => {
      const scale = (dataArray[i] / 255) * 1.5 + 0.3;
      stroke.style.transform = `scaleY(${scale})`;
    });
  }
  animate();

  // Resume audio context if suspended
  document.addEventListener("click", () => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  });

  // === One-time hover trigger ===
  let musicStarted = false;

  const startMusic = () => {
    if (!musicStarted) {
      bgMusic.play().catch(err => console.warn("Play blocked:", err));
      musicStarted = true;
    }
  };

  // Add hover listeners to headings & paragraphs
  document.querySelectorAll("h1, h2, h3, p").forEach(el => {
    el.addEventListener("mouseenter", startMusic, { once: true });
  });
});
