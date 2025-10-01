document.addEventListener("DOMContentLoaded", () => {
  // Use raw GitHub URL
  const bgMusic = new Audio("https://raw.githubusercontent.com/jag-proj3ct/jag-proj3ct.github.io/main/music/batb.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.5;

  console.log("Can play mp3?", bgMusic.canPlayType("audio/mpeg"));

  const strokes = document.querySelectorAll("#wave .stroke");

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

  function startMusic() {
    bgMusic.play()
      .then(() => {
        console.log("Audio started");
        if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        animate();
      })
      .catch(err => {
        console.error("Play failed:", err);
      });
  }

  document.querySelectorAll("h1, h2, h3, p").forEach(el => {
    el.addEventListener("mouseenter", startMusic, { once: true });
  });
});
