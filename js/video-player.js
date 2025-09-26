/* === DOM REFERENCES === */
const video = document.getElementById("curr_video");

const playpause_btn = document.querySelector(".playpause-track");
const next_btn = document.querySelector(".next-track");
const prev_btn = document.querySelector(".prev-track");

const curr_time = document.querySelector(".current-time");
const total_duration = document.querySelector(".total-duration");

let isPlaying = false;

/* === HELPERS === */
/**
 * Formats time from seconds into "mm:ss".
 * @param {number} secs - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/**
 * Resets player state (time + duration).
 */
function reset() {
  curr_time.textContent = "00:00";
  // Only set total duration if metadata is available
  if (!isNaN(video.duration)) {
    total_duration.textContent = formatTime(video.duration);
  } else {
    total_duration.textContent = "00:00";
  }
}

/* === PLAYBACK CONTROLS === */
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

/* === UPDATE TIMERS === */
function setUpdate() {
  if (isNaN(video.duration)) return;
  curr_time.textContent = formatTime(video.currentTime);
}

/* === EVENT LISTENERS === */
playpause_btn.addEventListener("click", playpauseVideo);

// Fast forward 10s
next_btn.addEventListener("click", () => {
  video.currentTime = Math.min(video.currentTime + 10, video.duration);
});

// Rewind 10s
prev_btn.addEventListener("click", () => {
  video.currentTime = Math.max(video.currentTime - 10, 0);
});

// Time updates
video.addEventListener("timeupdate", setUpdate);

// Reset on end
video.addEventListener("ended", pauseVideo);

// Metadata loaded = set duration
video.addEventListener("loadedmetadata", reset);

/* === INIT === */
reset();
