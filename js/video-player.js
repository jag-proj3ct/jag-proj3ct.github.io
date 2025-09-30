// ========================================
// DOM references
// ========================================
const video = document.getElementById("myVideo");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoControls = document.querySelector(".video-controls");

// ========================================
// 🎬 VIDEO LIST (Supports Multi-Part)
// ========================================
const basePath = "../videos/";

const original_video_list = [
  { name: "outro", file: "videos/copy_F5148D8D-9398-481A-A9B8-0306E0C5DDA6.mov" },
  { name: "outrotez", file: "videos/copy_F5148D8D-9398-481A-A9B8-0306E0C5DDA6.mov" }
];

// Flatten videos so each *entry* is one track, not each part
let flat_video_list = [];
original_video_list.forEach((vid, originalIndex) => {
  const videoFiles = Array.isArray(vid.file) ? vid.file : [vid.file];
  flat_video_list.push({
    name: vid.name,
    files: videoFiles.map(file => basePath + file),
    currentPart: 0,
    originalIndex
  });
});

let video_index = 0;

// ========================================
// Helper: Format time (MM:SS)
// ========================================
function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// ========================================
// Load Video
// ========================================
function loadVideo(index, part = 0) {
  if (index < 0) index = flat_video_list.length - 1;
  else if (index >= flat_video_list.length) index = 0;

  video_index = index;
  const track = flat_video_list[video_index];
  track.currentPart = part;

  video.src = track.files[track.currentPart];
  video.load();
}

// Once metadata is loaded, set duration text
video.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(video.duration);
});

// ========================================
// Controls
// ========================================

// Play / Pause
function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
  } else {
    video.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
  }
}
playPauseBtn.addEventListener("click", togglePlay);

// Sync play/pause button when playback changes (keyboard/autoplay etc.)
video.addEventListener("play", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
});
video.addEventListener("pause", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
});

// Update seek bar + current time
video.addEventListener("timeupdate", () => {
  if (!isNaN(video.duration)) {
    seekBar.value = (video.currentTime / video.duration) * 100;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }
});

// Seek
seekBar.addEventListener("input", () => {
  if (!isNaN(video.duration)) {
    video.currentTime = (seekBar.value / 100) * video.duration;
  }
});

// Volume
volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value / 100; // normalize 0–100 to 0–1
});

// Mute
muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted
    ? '<i class="fa fa-volume-mute"></i>'
    : '<i class="fa fa-volume-up"></i>';
});

// Fullscreen
fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen(); // Safari
    else if (video.msRequestFullscreen) video.msRequestFullscreen(); // IE/Edge
  }
});

// Don’t hide controls entirely in fullscreen, just keep them usable
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    videoControls.classList.add("fullscreen-active");
  } else {
    videoControls.classList.remove("fullscreen-active");
  }
});

// ========================================
// Handle Ended (auto next part / video)
// ========================================
video.addEventListener("ended", () => {
  const track = flat_video_list[video_index];
  if (track.currentPart < track.files.length - 1) {
    loadVideo(video_index, track.currentPart + 1);
    video.play();
  } else {
    loadVideo(video_index + 1, 0);
    video.play();
  }
});

// ========================================
// Init
// ========================================
loadVideo(0);
video.volume = volumeBar.value / 100; // sync slider to video
currentTimeEl.textContent = "00:00";
totalTimeEl.textContent = "00:00";
