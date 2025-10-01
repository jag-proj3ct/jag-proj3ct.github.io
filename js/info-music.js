document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = new Audio("./music/batb.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  const strokes = document.querySelectorAll("#wave .stroke");

  // Web Audio API setup
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
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

  // Function to start music & visualizer
  function startMusic() {
    if (bgMusic.paused) {
      bgMusic.play().then(() => {
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        animate();
      }).catch(err => {
        console.warn("Play blocked:", err);
      });
    }
  }

  // Attach hover listener to all headings and paragraphs
  document.querySelectorAll("h1, h2, p").forEach(el => {
    el.addEventListener("mouseenter", startMusic, { once: true });
  });
});
