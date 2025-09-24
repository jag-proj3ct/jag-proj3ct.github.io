/* DOM references */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
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
const wave = document.getElementById('wave');
const randomIcon = document.querySelector('.fa-random');
const repeatIcon = document.querySelector('.fa-repeat');
const curr_track = document.createElement('audio');

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let isRepeating = false;
let updateTimer;
let part_index = 0;

/* ---- Web Audio API setup ---- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);

analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* ---- Vinyl + Cover references ---- */
let vinylEl, coverEl;

function ensureArtChildren() {
  if (!track_art) return;
  coverEl = track_art.querySelector('.cover');
  vinylEl = track_art.querySelector('.vinyl');
}
ensureArtChildren();

/* ---- Wave animation ---- */
function renderWave() {
  requestAnimationFrame(renderWave);
  if (isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
    if (wave) {
      wave.style.display = "flex";
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
  {
    name: "Last Call",
    artist: "Kanye West",
    file: ["last-call1.mp3", "last-call2.mp3", "last-call3.mp3"]
  }
].map(track => ({
  img: track.cover || coverDefault,
  name: track.name,
  artist: track.artist || "Kanye West",
  music: Array.isArray(track.file)
    ? track.file.map(f => `${basePath}${f}`)
    : [`${basePath}${track.file}`]
}));

/* ---- Player functions ---- */
loadTrack(track_index);

function loadTrack(index) {
  clearInterval(updateTimer);
  reset();
  if (index < 0) index = 0;
  if (index >= music_list.length) index = music_list.length - 1;

  track_index = index;
  part_index = 0;
  curr_track.src = music_list[track_index].music[part_index];
  curr_track.load();

  if (coverEl) coverEl.style.backgroundImage = `url("${music_list[track_index].img}")`;
  track_name.textContent = music_list[track_index].name;
  track_artist.textContent = music_list[track_index].artist;
  now_playing.textContent = `Playing ${track_index + 1} of ${music_list.length}`;

  updateTimer = setInterval(setUpdate, 1000);
  curr_track.addEventListener('ended', handleTrackEnd);
}

function handleTrackEnd() {
  if (isRepeating) {
    curr_track.currentTime = 0;
    playTrack();
    return;
  }
  const currentTrack = music_list[track_index];
  if (part_index < currentTrack.music.length - 1) {
    part_index++;
    curr_track.src = currentTrack.music[part_index];
    curr_track.load();
    curr_track.play();
  } else {
    nextTrack();
  }
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
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  curr_track.play().catch(e => console.error("Play failed:", e));
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
  if (isRandom) {
    track_index = Math.floor(Math.random() * music_list.length);
  } else {
    track_index = (track_index + 1) % music_list.length;
  }
  loadTrack(track_index);
  playTrack();
}

function prevTrack() {
  track_index = (track_index - 1 + music_list.length) % music_list.length;
  loadTrack(track_index);
  playTrack();
}

function seekTo() {
  if (!curr_track.duration) return;
  const seekto = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekto;
}

function setVolume() {
  curr_track.volume = volume_slider ? volume_slider.value / 100 : 1;
}

function setUpdate() {
  if (!isNaN(curr_track.duration)) {
    const seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;

    const formatTime = (time) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    curr_time.textContent = formatTime(curr_track.currentTime);
    total_duration.textContent = formatTime(curr_track.duration);
  }
}

function randomTrack() {
  isRandom = !isRandom;
  if (isRandom) {
    randomIcon.classList.add('randomActive');
  } else {
    randomIcon.classList.remove('randomActive');
  }
}

function repeatTrack() {
  isRepeating = !isRepeating;
  if (isRepeating) {
    repeatIcon.classList.add('active');
  } else {
    repeatIcon.classList.remove('active');
  }
}

/* ---- Event Listeners ---- */
playpause_btn.addEventListener('click', playpauseTrack);
next_btn.addEventListener('click', nextTrack);
prev_btn.addEventListener('click', prevTrack);
seek_slider.addEventListener('input', seekTo);
volume_slider.addEventListener('input', setVolume);
random_btn.addEventListener('click', randomTrack);
repeat_btn.addEventListener('click', repeatTrack);
