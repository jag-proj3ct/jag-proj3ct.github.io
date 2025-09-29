// DOM references
const video = document.getElementById("myVideo");
const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoPlayer = document.querySelector(".video-player"); 
const videoControls = document.querySelector(".video-controls"); 

// Helper: format seconds → MM:SS
function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

// === Play / Pause toggle ===
playPauseBtn.addEventListener("click", () => {
  if (video.paused || video.ended) {
    video.play();
    playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
  } else {
    video.pause();
    playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
  }
});

// === Update seek bar + current time ===
video.addEventListener("timeupdate", () => {
  if (!isNaN(video.duration)) {
    seekBar.value = (video.currentTime / video.duration) * 100;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }
});

// === Seek bar → jump to position ===
seekBar.addEventListener("input", () => {
  if (!isNaN(video.duration)) {
    video.currentTime = (seekBar.value / 100) * video.duration;
  }
});

// === Volume control ===
volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value;
});

// === Mute toggle ===
muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted
    ? '<i class="fa fa-volume-mute"></i>'
    : '<i class="fa fa-volume-up"></i>';
});

// === Set total duration on load ===
video.addEventListener("loadedmetadata", () => {
  totalTimeEl.textContent = formatTime(video.duration);
});

// === Fullscreen toggle ===
fullscreenBtn.addEventListener("click", () => {
  const isFullscreen =
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  if (isFullscreen) {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    // Enter fullscreen
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  }
});

// === Detect fullscreen change → hide/show custom controls ===
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === video) {
    // In fullscreen → hide custom controls, enable native
    videoControls.style.display = "none";
    video.setAttribute("controls", "true");
  } else {
    // Exit fullscreen → show custom controls, remove native
    videoControls.style.display = "flex";
    video.removeAttribute("controls");
  }
});
