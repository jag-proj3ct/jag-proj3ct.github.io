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
//  VIDEO LIST
// ========================================
// ✅ fixed path to absolute /videos/ (root)
const basePath = "/videos/";

const original_video_list = [
  {
    name: "main-video",
    file: ["vidpt1.mov", "vidpt2.mov", "vidpt3.mov", "vidpt4.mov", "vidpt5.mov"]
  },
  { name: "outro", file: "copy_F5148D8D-9398-481A-A9B8-0306E0C5DDA6.mov" }
];

let flat_video_list = [];
original_video_list.forEach((vid, originalIndex) => {
  const videoFiles = Array.isArray(vid.file) ? vid.file : [vid.file];
  flat_video_list.push({
    name: vid.name,
    files: videoFiles.map(file => basePath + file), // keep exact filename
    currentPart: 0,
    originalIndex
  });
});

let video_index = 0;

// ========================================
// Helper: Format time
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

  // Clear old sources
  video.innerHTML = "";

  const url = track.files[track.currentPart];

  const source = document.createElement("source");
  source.src = url;
  source.type = url.endsWith(".mp4") ? "video/mp4" : "video/quicktime";
  video.appendChild(source);

  video.load();
}

// ========================================
// Error Handling → Skip to next
// ========================================
video.addEventListener("error", () => {
  console.warn("⚠️ Video failed to load, skipping...");
  const track = flat_video_list[video_index];
  if (track.currentPart < track.files.length - 1) {
    loadVideo(video_index, track.currentPart + 1);
    video.play().catch(() => {});
  } else {
    loadVideo(video_index + 1, 0);
    video.play().catch(() => {});
  }
});

// ========================================
// Metadata → update duration
// ========================================
video.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(video.duration);
});

// ========================================
// Controls
// ========================================
function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}
playPauseBtn.addEventListener("click", togglePlay);

video.addEventListener("play", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
});
video.addEventListener("pause", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
});

video.addEventListener("timeupdate", () => {
  if (!isNaN(video.duration)) {
    seekBar.value = (video.currentTime / video.duration) * 100;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }
});

seekBar.addEventListener("input", () => {
  if (!isNaN(video.duration)) {
    video.currentTime = (seekBar.value / 100) * video.duration;
  }
});

volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value;
});

muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted
    ? '<i class="fa fa-volume-mute"></i>'
    : '<i class="fa fa-volume-up"></i>';
});

// ✅ Fullscreen now works properly
fullscreenBtn.addEventListener("click", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    if (video.parentElement.requestFullscreen) video.parentElement.requestFullscreen();
    else if (video.parentElement.webkitRequestFullscreen) video.parentElement.webkitRequestFullscreen();
    else if (video.parentElement.msRequestFullscreen) video.parentElement.msRequestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    videoControls.classList.add("fullscreen-active");
  } else {
    videoControls.classList.remove("fullscreen-active");
  }
});

// ========================================
// Ended → auto next part / video
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
video.volume = volumeBar.value;
currentTimeEl.textContent = "00:00";
totalTimeEl.textContent = "00:00";
