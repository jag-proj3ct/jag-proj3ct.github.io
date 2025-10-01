// INFO PAGE MUSIC PLAYER (Single Track)

// DOM references
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
const coverEl = track_art.querySelector('.cover');

// Wrap cover in <a>
const coverLink = document.createElement("a");
coverLink.href = "#"; // no Spotify link for now
coverLink.target = "_blank";
coverLink.classList.add("cover-link");
coverLink.appendChild(coverEl.cloneNode(true));
track_art.replaceChild(coverLink, coverEl);

const track_name = document.querySelector('.track-name');
const track_artist = document.querySelector('.track-artist');

const playpause_btn = document.querySelector('.playpause-track');
const next_btn = document.querySelector('.next-track');
const prev_btn = document.querySelector('.prev-track');
const random_btn = document.querySelector('.random-track');
const repeat_btn = document.querySelector('.repeat-track');

const seek_slider = document.querySelector('.seek_slider');
const volume_slider = document.querySelector('.volume_slider');
const curr_time = document.querySelector('.current-time');
const total_duration = document.querySelector('.total-duration');

const loader = document.querySelector('.loader');
const strokes = loader ? Array.from(loader.querySelectorAll('.stroke')) : [];

// --- TRACK LIST (only one song) ---
const music_list = [
  {
    name: "Beauty and the Beast",
    artist: "Disney",
    url: "#",
    artistUrl: "#",
    img: "./images/batb-cover.jpg", // provide your own cover image here
    musicSrc: "https://raw.githubusercontent.com/jag-proj3ct/jag-proj3ct.github.io/main/music/batb.mp3"
  }
];

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let isRepeating = false;
let updateTimer = null;

const curr_track = new Audio();

// Time formatting helper
function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${min.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Reset UI
function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

// Load the single track
function loadTrack() {
  clearInterval(updateTimer);
  reset();

  const track = music_list[track_index];
  curr_track.src = track.musicSrc;
  curr_track.load();

  curr_track.onloadedmetadata = () => {
    total_duration.textContent = formatTime(curr_track.duration);
    now_playing.textContent = "Playing 1 of 1";
  };

  // Update UI elements
  const cover = coverLink.querySelector(".cover");
  if (cover) cover.style.backgroundImage = `url("${track.img}")`;

  track_name.textContent = track.name;
  track_name.href = track.url;
  track_artist.textContent = track.artist;
  track_artist.href = track.artistUrl;

  updateTimer = setInterval(setUpdate, 1000);
}

// Update seek/time
function setUpdate() {
  if (isNaN(curr_track.duration)) return;

  const seekPosition = (curr_track.currentTime / curr_track.duration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(curr_track.currentTime);
}

// --- PLAYER CONTROLS ---
function playTrack() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  curr_track.play().catch(e => console.error("Play failed:", e));
  isPlaying = true;
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
  if (loader) loader.classList.add('visible');
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
  if (loader) loader.classList.remove('visible');
}

function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}

function nextTrack() {
  loadTrack(); // reloads the same song
  playTrack();
}

function prevTrack() {
  loadTrack(); // reloads the same song
  playTrack();
}

// Seek
function seekTo() {
  if (isNaN(curr_track.duration)) return;
  const seekTime = (seek_slider.value / 100) * curr_track.duration;
  curr_track.currentTime = seekTime;
}

// Volume
function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

// --- Web Audio API Visualizer ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

function renderWave() {
  requestAnimationFrame(renderWave);
  if (!loader) return;

  if (isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    loader.classList.add('visible');
    const step = Math.floor(dataArray.length / strokes.length);
    strokes.forEach((stroke, i) => {
      let value = dataArray[i * step] / 256;
      if (i < 3) value = Math.sqrt(value);
      stroke.style.transform = `scaleY(${Math.max(0.2, value * 1.0)})`;
    });
  } else {
    loader.classList.remove('visible');
    strokes.forEach(stroke => stroke.style.transform = 'scaleY(0.2)');
  }
}
if (loader) renderWave();

// --- EVENT LISTENERS ---
playpause_btn.addEventListener('click', playpauseTrack);
next_btn.addEventListener('click', nextTrack);
prev_btn.addEventListener('click', prevTrack);

repeat_btn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  repeat_btn.classList.toggle('active', isRepeating);
});

random_btn.addEventListener('click', () => {
  isRandom = !isRandom;
  random_btn.classList.toggle('active', isRandom);
});

curr_track.addEventListener('ended', () => {
  if (isRepeating) {
    curr_track.currentTime = 0;
    playTrack();
  } else {
    nextTrack(); // with only one track, just reload it
  }
});

seek_slider.addEventListener('input', seekTo);
volume_slider.addEventListener('input', setVolume);
curr_track.volume = volume_slider.value / 100;

// Init
loadTrack();
