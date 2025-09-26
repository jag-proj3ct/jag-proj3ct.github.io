/* DOM references */
const video = document.getElementById("curr_video");

const playpause_btn = document.querySelector(".playpause-track");
const next_btn = document.querySelector(".next-track");
const prev_btn = document.querySelector(".prev-track");
const repeat_btn = document.querySelector(".repeat-track");

const seek_slider = document.querySelector(".seek_slider");
const volume_slider = document.querySelector(".volume_slider");
const curr_time = document.querySelector(".current-time");
const total_duration = document.querySelector(".total-duration");

let isPlaying = false;
let isRepeating = false;
let updateTimer;

/* Reset */
function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

/* Play / Pause */
function playVideo() {
  video.play();
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseVideo() {
  video.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function playpauseVideo() {
  isPlaying ? pauseVideo() : playVideo();
}

/* Seek */
function seekTo() {
  const seekto = video.duration * (seek_slider.value / 100);
  video.currentTime = seekto;
}

/* Volume */
function setVolume() {
  video.volume = volume_slider.value / 100;
}

/* Update time */
function setUpdate() {
  if (isNaN(video.duration)) return;
  const seekPosition = (video.currentTime / video.duration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(video.currentTime);
  total_duration.textContent = formatTime(video.duration);
}

/* Format mm:ss */
function formatTime(secs) {
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

/* Event listeners */
playpause_btn.addEventListener("click", playpauseVideo);

next_btn.addEventListener("click", () => {
  video.currentTime = Math.min(video.currentTime + 10, video.duration);
});

prev_btn.addEventListener("click", () => {
  video.currentTime = 0;
});

repeat_btn.addEventListener("click", () => {
  isRepeating = !isRepeating;
  video.loop = isRepeating;
  repeat_btn.classList.toggle("active", isRepeating);
});

seek_slider.addEventListener("input", seekTo);
volume_slider.addEventListener("input", setVolume);

video.addEventListener("timeupdate", setUpdate);
video.addEventListener("ended", () => {
  if (!isRepeating) pauseVideo();
});

/* Init */
reset();
