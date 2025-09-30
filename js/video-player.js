// DOM references
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
  {
    name: "main-video",
    file: ["vidpt1.MOV", "vidpt2.mov", "vidpt4.mov", "vidpt5.mov",]
  },
  {
    name: "outro",
    file: ["outro1.mov", "outro2.mov"]
  }
  //{ name: "bloopers soon", file: "bloop1.mov" }
  //{ name: "bloopers soon", file: "bloop2.mov" }
  //{ name: "bloopers soon", file: "bloop3.mov" }
  //{ name: "bloopers soon", file: "bloop4.mov" }
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

// Current state
let video_index = 0;

// ========================================
// Helper: Format time (MM:SS)
// ========================================
function formatTime(sec) {
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

  video.addEventListener("loadedmetadata", () => {
    totalTimeEl.textContent = formatTime(video.duration);
  });
}

// ========================================
// Controls
// ========================================

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
  video.volume = volumeBar.value;
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
    video.requestFullscreen();
  }
});

// Toggle controls in fullscreen
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === video) {
    videoControls.style.display = "none";
    video.setAttribute("controls", "true");
  } else {
    videoControls.style.display = "flex";
    video.removeAttribute("controls");
  }
});

// ========================================
// Handle Ended (auto next part / video)
// ========================================
video.addEventListener("ended", () => {
  const track = flat_video_list[video_index];

  if (track.currentPart < track.files.length - 1) {
    // Still inside this entry → load next part
    loadVideo(video_index, track.currentPart + 1);
    video.play();
  } else {
    // Finished this entry → move to next entry
    loadVideo(video_index + 1, 0);
    video.play();
  }
});

// ========================================
// Init
// ========================================
loadVideo(0);
