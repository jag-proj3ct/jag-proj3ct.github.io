const video = document.getElementById("myVideo");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const fullscreenBtn = document.getElementById("fullscreenBtn");

function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// Play / Pause
playPauseBtn.addEventListener("click", () => {
  if (video.paused || video.ended) {
    video.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
  } else {
    video.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
  }
});

// Update Seek
video.addEventListener("timeupdate", () => {
  const value = (100 / video.duration) * video.currentTime;
  seekBar.value = value;
  currentTimeEl.textContent = formatTime(video.currentTime);
});

seekBar.addEventListener("input", () => {
  video.currentTime = (seekBar.value / 100) * video.duration;
});

// Volume
volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value;
});

// Mute
muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted ? '<i class="fa fa-volume-mute"></i>' : '<i class="fa fa-volume-up"></i>';
});

// Duration
video.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(video.duration);
});

// Fullscreen
fullscreenBtn.addEventListener("click", () => {
  if (video.requestFullscreen) video.requestFullscreen();
  else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
});
