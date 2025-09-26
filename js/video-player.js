/* DOM references */
const video = document.getElementById("curr_video");

const playpause_btn = document.querySelector(".playpause-track");
const next_btn = document.querySelector(".next-track");
const prev_btn = document.querySelector(".prev-track");

const seek_slider = document.querySelector(".seek_slider");
const volume_slider = document.querySelector(".volume_slider");
const curr_time = document.querySelector(".current-time");
const total_duration = document.querySelector(".total-duration");

let isPlaying = false;

// Set initial volume to slider value
video.volume = volume_slider.value / 100;

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
  seek_slider.value = 0;
  // Only set total duration if the video metadata is available
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

/* Seek functions */
function seekTo() {
  const seekto = video.duration * (seek_slider.value / 100);
  video.currentTime = seekto;
}

/**
 * Updates the time slider and current time display based on video progress.
 */
function setUpdate() {
  if (isNaN(video.duration)) return;
  
  const seekPosition = (video.currentTime / video.duration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(video.currentTime);
}

/* Volume control */
function setVolume() {
  video.volume = volume_slider.value / 100;
  // Optional: Update volume icon based on level
  const volIcon = document.querySelector(".volume i");
  if (video.volume === 0) {
    volIcon.className = "fa fa-volume-off";
  } else if (video.volume < 0.5) {
    volIcon.className = "fa fa-volume-down";
  } else {
    volIcon.className = "fa fa-volume-up";
  }
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

seek_slider.addEventListener("input", seekTo);
volume_slider.addEventListener("input", setVolume);

// Crucial event for dynamic updates
video.addEventListener("timeupdate", setUpdate);
video.addEventListener("ended", pauseVideo);

// Ensures total duration is set as soon as the video metadata is loaded
video.addEventListener("loadedmetadata", () => {
  reset();
});

/* Init */
// Call reset initially. It will be called again on 'loadedmetadata' to set the duration.
reset();
