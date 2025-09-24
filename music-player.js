/* DOM references */
let now_playing = document.querySelector('.now-playing');
let track_art = document.querySelector('.track-art');
let track_name = document.querySelector('.track-name');
let track_artist = document.querySelector('.track-artist');

let playpause_btn = document.querySelector('.playpause-track');
let next_btn = document.querySelector('.next-track');
let prev_btn = document.querySelector('.prev-track');

let seek_slider = document.querySelector('.seek_slider');
let volume_slider = document.querySelector('.volume_slider');
let curr_time = document.querySelector('.current-time');
let total_duration = document.querySelector('.total-duration');
let wave = document.getElementById('wave');
let randomIcon = document.querySelector('.fa-random');
let curr_track = document.createElement('audio');

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;

/* ---- Web Audio API setup ---- */
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioCtx.createAnalyser();
let source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
let bufferLength = analyser.frequencyBinCount;
let dataArray = new Uint8Array(bufferLength);

/* ---- Vinyl + Cover references ---- */
let vinylEl, coverEl;

function ensureArtChildren() {
  if (!track_art) return;

  coverEl = track_art.querySelector('.cover');
  vinylEl = track_art.querySelector('.vinyl');

  if (!vinylEl) {
    vinylEl = document.createElement('div');
    vinylEl.className = 'vinyl';
    track_art.insertBefore(vinylEl, track_art.firstChild);
  }

  if (!coverEl) {
    coverEl = document.createElement('div');
    coverEl.className = 'cover';
    track_art.appendChild(coverEl);
  }
}
ensureArtChildren();

/* ---- Wave animation ---- */
function renderWave() {
  requestAnimationFrame(renderWave);
  if (isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    let volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    if (wave) {
      wave.style.display = "block";
      wave.style.transform = `scaleY(${Math.max(0.25, volume / 100)})`;
    }
  } else {
    if (wave) wave.style.display = "none";
  }
}
renderWave();

/* ---- Music list (College Dropout full tracklist) ---- */
const basePath = "./music/";
const coverDefault = "./images/college-dropout-cover.jpg";

const music_list = [
  { name: "Intro (Skit)", file: "intro.mp3" },
  { name: "We Don’t Care", file: "we-dont-care.mp3" },
  { name: "Graduation Day", file: "graduation-day.mp3" },
  { name: "All Falls Down", file: "all-falls-down.mp3" },
  { name: "I’ll Fly Away", file: "ill-fly-away.mp3" },
  { name: "Spaceship", file: "spaceship.mp3" },
  { name: "Jesus Walks", file: "jesuswalks.mp3" },
  { name: "Never Let Me Down", file: "never-let-me-down.mp3" },
  { name: "Get Em High", file: "get-em-high.mp3" },
  { name: "Workout Plan (Skit)", file: "workout-plan.mp3" },
  { name: "The New Workout Plan", file: "new-workout-plan.mp3" },
  { name: "Slow Jamz", file: "slow-jamz.mp3" },
  { name: "Breathe In Breathe Out", file: "bibo.mp3" },
  { name: "School Spirit (Skit 1)", file: "ss-s1.mp3" },
  { name: "School Spirit", file: "school-spirit.mp3" },
  { name: "School Spirit (Skit 2)", file: "ss-s2.mp3" },
  { name: "Lil Jimmy (Skit)", file: "lil-jimmy.mp3" },
  { name: "Two Words", file: "2words.mp3" },
  { name: "Through the Wire", file: "through-the-wire.mp3" },
  { name: "Family Business", file: "family-business.mp3" },

    // ---- Last Call as one logical track with 3 files ----
  { 
    name: "Last Call", 
    file: ["last-call1.mp3", "last-call2.mp3", "last-call3.mp3"] 
  }
].map(track => ({
  img: track.cover || coverDefault,
  name: track.name,
  artist: track.artist || "Kanye West",
  music: `${basePath}/${track.file}`
}));

/* ---- Player functions ---- */
loadTrack(track_index);
// document.body.style.background = "#222";

function loadTrack(index) {
  clearInterval(updateTimer);
  reset();

  if (index < 0) index = 0;
  if (index >= music_list.length) index = music_list.length - 1;

  curr_track.src = music_list[index].music;
  curr_track.load();

  ensureArtChildren();
  if (coverEl) coverEl.style.backgroundImage = `url("${music_list[index].img}")`;

  track_name.textContent = music_list[index].name;
  track_artist.textContent = music_list[index].artist;
  now_playing.textContent = `Playing ${index + 1} of ${music_list.length}`;

  updateTimer = setInterval(setUpdate, 1000);
  curr_track.addEventListener('ended', nextTrack);
}

function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}
function playTrack() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  curr_track.play().catch(() => {});
  isPlaying = true;
  if (vinylEl) vinylEl.classList.add('playing');
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}
function pauseTrack() {
  curr_track.pause();
  isPlaying = false;
  if (vinylEl) vinylEl.classList.remove('playing');
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}
function nextTrack() {
  if (track_index < music_list.length - 1 && !isRandom) {
    track_index++;
  } else if (track_index < music_list.length - 1 && isRandom) {
    track_index = Math.floor(Math.random() * music_list.length);
  } else {
    track_index = 0;
  }
  loadTrack(track_index);
  playTrack();
}
function prevTrack() {
  track_index = track_index > 0 ? track_index - 1 : music_list.length - 1;
  loadTrack(track_index);
  playTrack();
}
function seekTo() {
  if (!curr_track.duration) return;
  let seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}
function setVolume() {
  curr_track.volume = (volume_slider && volume_slider.value) ? volume_slider.value / 100 : 1;
}
function setUpdate() {
  if (!isNaN(curr_track.duration)) {
    let seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime % 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration % 60);

    if (currentSeconds < 10) currentSeconds = "0" + currentSeconds;
    if (durationSeconds < 10) durationSeconds = "0" + durationSeconds;
    if (currentMinutes < 10) currentMinutes = "0" + currentMinutes;
    if (durationMinutes < 10) durationMinutes = "0" + durationMinutes;

    curr_time.textContent = `${currentMinutes}:${currentSeconds}`;
    total_duration.textContent = `${durationMinutes}:${durationSeconds}`;
  }
}
