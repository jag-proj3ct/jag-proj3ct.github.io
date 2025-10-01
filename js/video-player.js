// DOM references
const video = document.getElementById("myVideo");
const bufferVideo = document.createElement("video"); // hidden preloader
bufferVideo.muted = true;
bufferVideo.style.display = "none";
document.body.appendChild(bufferVideo);

const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoControls = document.querySelector(".video-controls");

// VIDEO LIST
const basePath = "/videos/";

const original_video_list = [
  { name: "main", file: ["main1","main2"] },
  { name: "outro", file: ["outro1","outro2"] }
];

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

// Helper: Format time
function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// Load Video into video
function loadVideoElement(target, index, part = 0) {
  target.innerHTML = "";
  const track = flat_video_list[index];
  const baseFile = track.files[part];

  const sourceMP4 = document.createElement("source");
  sourceMP4.src = baseFile + ".mp4";
  sourceMP4.type = "video/mp4";
  target.appendChild(sourceMP4);

  const sourceMOV = document.createElement("source");
  sourceMOV.src = baseFile + ".mov";
  sourceMOV.type = "video/quicktime";
  target.appendChild(sourceMOV);

  target.load();
}

// Main Loader
function loadVideo(index, part = 0) {
  video_index = index;
  flat_video_list[index].currentPart = part;
  loadVideoElement(video, index, part);

  // preload next part
  preloadNext(index, part);
}

// Preload helper
function preloadNext(index, part) {
  const track = flat_video_list[index];
  if (part < track.files.length - 1) {
    loadVideoElement(bufferVideo, index, part + 1);
  } else if (index < flat_video_list.length - 1) {
    loadVideoElement(bufferVideo, index + 1, 0);
  }
}

// On video ended → swap instantly
video.addEventListener("ended", () => {
  const track = flat_video_list[video_index];

  if (track.currentPart < track.files.length - 1) {
    track.currentPart++;
    swapToBuffer(video_index, track.currentPart);
  } else {
    video_index++;
    if (video_index >= flat_video_list.length) video_index = 0;
    flat_video_list[video_index].currentPart = 0;
    swapToBuffer(video_index, 0);
  }
});

function swapToBuffer(index, part) {
  // swap current <video> with preloaded one
  const wasMuted = video.muted;
  const vol = video.volume;

  const newSrc = bufferVideo.querySelector("source").src;
  loadVideoElement(video, index, part);
  video.volume = vol;
  video.muted = wasMuted;

  // autoplay
  video.play();
  preloadNext(index, part);
}

// Controls 
function togglePlay() {
  if (video.paused || video.ended) video.play();
  else video.pause();
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
    video.currentTime = (seekBar.value/100)*video.duration;
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

fullscreenBtn.addEventListener("click", () => {
  if (video.webkitEnterFullscreen) {
    video.webkitEnterFullscreen();
  } else if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (video.requestFullscreen) {
    video.requestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === video) {
    video.classList.add("video-fullscreen");
    videoControls.classList.add("fullscreen-active");
  } else {
    video.classList.remove("video-fullscreen");
    videoControls.classList.remove("fullscreen-active");
  }
});

// Init
loadVideo(0, 0);
video.volume = volumeBar.value;
currentTimeEl.textContent = "00:00";
totalTimeEl.textContent = "00:00";
