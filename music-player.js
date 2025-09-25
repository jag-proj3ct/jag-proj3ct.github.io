/* DOM references */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
const coverEl = track_art.querySelector('.cover');
const vinylEl = track_art.querySelector('.vinyl');
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

const curr_track = new Audio();

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let isRepeating = false;
let updateTimer = null;
let part_index = 0;

/* Web Audio API setup */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* Visualizer strokes */
const strokes = Array.from(wave.querySelectorAll('.stroke'));

/* Wave animation */
function renderWave() {
  requestAnimationFrame(renderWave);
  if (isPlaying) {
    analyser.getByteFrequencyData(dataArray);
    wave.classList.add('visible');
    const step = Math.floor(dataArray.length / strokes.length);
    strokes.forEach((stroke, i) => {
      let value = dataArray[i * step] / 256;
      if (i < 3) value = Math.sqrt(value); // amplify low bars
      stroke.style.transform = `scaleY(${Math.max(0.2, value * 1.2)})`;
    });
  } else {
    wave.classList.remove('visible');
    strokes.forEach(stroke => {
      stroke.style.transform = `scaleY(0.2)`;
    });
  }
}
renderWave();

/* Music list */
const basePath = "./music/";
const coverDefault = "./images/college-dropout-cover.jpg";

const music_list = [
  { name: "Intro (Skit)", file: "intro.mp3" },
  { name: "We Don’t Care", file: "we-dont-care.mp3" },
  { name: "Graduation Day", file: "graduation-day.mp3" },
  { name: "All Falls Down", file: "all-falls-down.mp3" },
  { name: "I’ll Fly Away", file: "fly-away.mp3" },
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
    file: ["lastcall1.mp3", "lastcall2.mp3", "lastcall3.mp3"]
  }
].map(track => ({
  img: track.cover || coverDefault,
  name: track.name,
  artist: track.artist || "Kanye West",
  music: Array.isArray(track.file)
    ? track.file.map(f => basePath + f)
    : [basePath + track.file]
}));

/* Player functions */
function loadTrack(index) {
  clearInterval(updateTimer);
  reset();

  // Clamp index
  if (index < 0) index = music_list.length - 1;
  if (index >= music_list.length) index = 0;

  track_index = index;
  part_index = 0;
  const track = music_list[track_index];

  curr_track.src = track.music[part_index];
  curr_track.load();

  if (coverEl) coverEl.style.backgroundImage = `url("${track.img}")`;
  track_name.textContent = track.name;
  track_artist.textContent = track.artist;
  now_playing.textContent = `Playing ${track_index + 1} of ${music_list.length}`;

  updateTimer = setInterval(setUpdate, 1000);
}

function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

function playTrack() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  curr_track.play().catch(e => console.error("Play failed:", e));
  isPlaying = true;

  if (vinylEl) {
    vinylEl.classList.remove('return', 'spinning');
    // Trigger reflow to restart animation
    void vinylEl.offsetWidth;
    vinylEl.classList.add('sliding');

    // After sliding ends, add spinning
    vinylEl.addEventListener('transitionend', () => {
      vinylEl.classList.remove('sliding');
      vinylEl.classList.add('spinning');
    }, { once: true });
  }

  track_art.classList.add('playing');
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  if (vinylEl) {
    vinylEl.classList.remove('sliding', 'spinning');
    vinylEl.classList.add('return'); // Move vinyl back
  }

  track_art.classList.remove('playing');
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
}

function playpauseTrack() {
  if (isPlaying) pauseTrack();
  else playTrack();
}

function seekTo() {
  if (!curr_track.duration) return;
  const seekToTime = curr_track.duration * (seek_slider.value / 100);
  curr_track.currentTime = seekToTime;
}

function setVolume() {
  if (volume_slider) curr_track.volume = volume_slider.value / 100;
}

function setUpdate() {
  if (isNaN(curr_track.duration)) return;

  const seekPosition = curr_track.currentTime * (100 / curr_track.duration);
  seek_slider.value = seekPosition;

  const formatTime = time => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).pad
