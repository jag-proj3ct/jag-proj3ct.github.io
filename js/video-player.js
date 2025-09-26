/* DOM references */
const video = document.getElementById("curr_video");

const playpause_btn = document.querySelector(".playpause-track");
const next_btn = document.querySelector(".next-track");
const prev_btn = document.querySelector(".prev-track");

const curr_time = document.querySelector(".current-time");
const total_duration = document.querySelector(".total-duration");
const volume_display = document.querySelector(".volume-display");

let isPlaying = false;

// Always set volume to 100%
video.volume = 1.0;
if (volume_display) {
  volume_display.textContent = "100%";
}

/**
 * Formats time from seconds into the "mm:ss" string format.
 * @param {number} secs The time in seconds.
 * @returns {string} The formatted time string.
 */
function formatTime(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Resets the player state, ensuring total duration is set if metadata is loaded.
 */
function reset() {
  curr_time.textContent = "00:00";
  if (!isNaN(video.duration)) {
    total_duration.textContent = formatTime(video.duration);
  } else {
    total_duration.textContent = "00:00";
  }
}

/* Play / Pause functions */
function playVideo() {
  video.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause fa-3x"></i>';
}

function pauseVideo() {
  video.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play fa-3x"></i>';
}

function playpauseVideo() {
  isPlaying ? pauseVideo() : playVideo();
}

/**
 * Updates the current time display based on video progress.
 */
function setUpdate() {
  if (isNaN(video.duration)) return;
  curr_time.textContent = formatTime(video.currentTime);
}

/* Event listeners */
playpause_btn.addEventListener("click", playpauseVideo);

// Fast forward 10 seconds
next_btn.addEventListener("click", () => {
  video.currentTime = Math.min(video.currentTime + 10, video.duration);
});

// Rewind 10 seconds
prev_btn.addEventListener("click", () => {
  video.currentTime = Math.max(video.currentTime - 10, 0);
});

video.addEventListener("timeupdate", setUpdate);
video.addEventListener("ended", pauseVideo);

// Ensures total duration is set as soon as the video metadata is loaded
video.addEventListener("loadedmetadata", () => {
  reset();
});

/* Init */
reset();
