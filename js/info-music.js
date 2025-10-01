document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = new Audio("./music/batb.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  const strokes = document.querySelectorAll("#wave .stroke");

  // Remove any CSS animation so JS can take over
  strokes.forEach(stroke => {
    stroke.style.animation = "none";
  });

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
      const scale = (dataArray[i] / 255) * 2 + 0.2; 
      stroke.style.transform = `scaleY(${scale})`;
    });
  }

  // Try autoplay, otherwise wait for click
  bgMusic.play().then(() => {
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    animate();
  }).catch(() => {
    console.warn("Autoplay blocked. Waiting for click...");
    document.addEventListener("click", () => {
      bgMusic.play();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      animate();
    }, { once: true });
  });
});
