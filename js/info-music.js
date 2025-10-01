document.addEventListener("DOMContentLoaded", () => {
  // Playlist (add more songs here later if you want)
  const tracks = [
    "https://raw.githubusercontent.com/jag-proj3ct/jag-proj3ct.github.io/main/music/batb.mp3"
  ];
  let trackIndex = 0;

  const audio = new Audio(tracks[trackIndex]);
  audio.loop = false;
  audio.volume = 0.5;

  const strokes = document.querySelectorAll("#wave .stroke");

  // AudioContext setup for visualizer
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 64;
  const source = audioCtx.createMediaElementSource(audio);
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

  function playTrack() {
    audio.play().then(() => {
      if (audioCtx.state === "suspended") audioCtx.resume();
      animate();
    }).catch(err => console.error("Play failed:", err));
  }

  function pauseTrack() {
    audio.pause();
  }

  function nextTrack() {
    trackIndex = (trackIndex + 1) % tracks.length;
    audio.src = tracks[trackIndex];
    playTrack();
  }

  function prevTrack() {
    trackIndex = (trackIndex - 1 + tracks.length) % tracks.length;
    audio.src = tracks[trackIndex];
    playTrack();
  }

  function repeatTrack() {
    audio.currentTime = 0;
    playTrack();
  }

  // Buttons
  document.querySelector(".playpause-track").addEventListener("click", () => {
    if (audio.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  });

  document.querySelector(".next-track").addEventListener("click", nextTrack);
  document.querySelector(".prev-track").addEventListener("click", prevTrack);
  document.querySelector(".repeat-track").addEventListener("click", repeatTrack);

  // Optional: random button
  document.querySelector(".random-track").addEventListener("click", () => {
    trackIndex = Math.floor(Math.random() * tracks.length);
    audio.src = tracks[trackIndex];
    playTrack();
  });
});
