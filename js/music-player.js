/* DOM references */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
const coverEl = track_art.querySelector('.cover');

// Vinyl elements
const vinylContainerEl = track_art.querySelector('.vinyl');
const vinylEl = vinylContainerEl ? vinylContainerEl.querySelector('.vinyl-inner') : null;

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

const curr_track = new Audio();

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let isRepeating = false;
let updateTimer = null;
let part_index = 0;
let totalTrackDuration = 0; // store total duration of multi-part track

/* Web Audio API */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* Visualizer */
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
      stroke.style.transform = `scaleY(${Math.max(0.2, value * 1.2)})`;
    });
  } else {
    loader.classList.remove('visible');
    strokes.forEach(stroke => stroke.style.transform = 'scaleY(0.2)');
  }
}
if (loader) renderWave();

/* Music list setup */
const basePath = "./music/";
const coverDefault = "./images/college-dropout-cover.jpg";
const kanyeSpotify = "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x";

const music_list = [
  { name: "Intro (Skit)", file: "intro.mp3", url: "https://open.spotify.com/track/7lIr3vVhpDkU5mQEDcnA0S" },
  { name: "We Don’t Care", file: "we-dont-care.mp3", url: "https://open.spotify.com/track/0IW0qaeyxL5Et4UG2MrJKB" },
  { name: "Graduation Day", file: "graduation-day.mp3", url: "https://open.spotify.com/track/7wL7Lb8Q3aYyq6gmRL0PZqQ" },
  { name: "All Falls Down", file: "all-falls-down.mp3", url: "https://open.spotify.com/track/5SkRLpaGtvYPhw02vZhQQ9" },
  { name: "I’ll Fly Away", file: "fly-away.mp3", url: "https://open.spotify.com/track/6MgGapP3EPFm9kYUvYBTZR" },
  { name: "Spaceship", file: "spaceship.mp3", url: "https://open.spotify.com/track/1ko2NuvWlQdxtNRc8QQzmT" },
  { name: "Jesus Walks", file: "jesuswalks.mp3", url: "https://open.spotify.com/track/5g1vtHqi9uV7xtYeCcFOBx" },
  { name: "Never Let Me Down", file: "never-let-me-down.mp3", url: "https://open.spotify.com/track/34j4OxJxKznBs88cjSL2j9" },
  { name: "Get Em High", file: "get-em-high.mp3", url: "https://open.spotify.com/track/1PS1QMdUqOal0ai3Gt7sDQ" },
  { name: "Workout Plan (Skit)", file: "workout-plan.mp3", url: "https://open.spotify.com/track/2a1JSfTePKhysdIif2bzut" },
  { name: "The New Workout Plan", file: "new-workout-plan.mp3", url: "https://open.spotify.com/track/1Vp4St7JcXaUoJcIahtf3L" },
  { name: "Slow Jamz", file: "slow-jamz.mp3", url: "https://open.spotify.com/track/3A4cpTBPaIQdtPFb5JxtaX" },
  { name: "Breathe In Breathe Out", file: "bibo.mp3", url: "https://open.spotify.com/track/4KFY4EEv9CN6ivrzD6vEvg" },
  { name: "School Spirit (Skit 1)", file: "ss-s1.mp3", url: "https://open.spotify.com/track/25mwJPzWVmS2yronBNQJF1" },
  { name: "School Spirit", file: "school-spirit.mp3", url: "https://open.spotify.com/track/1th3G3okofWlvGWAAR7Y4V" },
  { name: "School Spirit (Skit 2)", file: "ss-s2.mp3", url: "https://open.spotify.com/track/5MAY7XyW322jMwLDtBQgsZ" },
  { name: "Lil Jimmy (Skit)", file: "#", url: "https://open.spotify.com/track/3B5ftYUfOUVny9sQzmgPjK" }, // placeholder
  { name: "Two Words", file: "2words.mp3", url: "https://open.spotify.com/track/62wtttQzoIA9HnNmGVd9Yq" },
  { name: "Through the Wire", file: "through-the-wire.mp3", url: "https://open.spotify.com/track/4mmkhcEm1Ljy1U9nwtsxUo" },
  { name: "Family Business", file: "family-business.mp3", url: "https://open.spotify.com/track/5DBmXF7QO43Cuy9yqva116" },
  {
    name: "Last Call",
    file: ["lastcall1.mp3", "lastcall2.mp3", "lastcall3.mp3"],
    url: "https://open.spotify.com/track/7iOhWWYjhhQiXzF4o4HhXN"
  }
].map(track => ({
  img: coverDefault,
  name: track.name,
  artist: "Kanye West",
  url: track.url || kanyeSpotify,
  artistUrl: kanyeSpotify,
  music: track.file === "#"
    ? [] // Lil Jimmy → no playable file
    : Array.isArray(track.file)
      ? track.file.map(f => basePath + f)
      : [basePath + track.file]
}));

/* Reset */
function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
  totalTrackDuration = 0;
}

/* Load track (skips unavailable) */
function loadTrack(index) {
  clearInterval(updateTimer);
  reset();

  if (index < 0) index = music_list.length - 1;
  else if (index >= music_list.length) index = 0;

  track_index = index;
  part_index = 0;
  const track = music_list[track_index];

  if (!track.music.length) {
    console.warn(`Skipping unavailable track: ${track.name}`);
    return loadTrack(track_index + 1);
  }

  curr_track.src = track.music[part_index];
  curr_track.load();

  // preload durations
  track.musicDurations = [];
  const promises = track.music.map((src, i) => new Promise(resolve => {
    const tempAudio = new Audio(src);
    tempAudio.addEventListener("loadedmetadata", () => {
      track.musicDurations[i] = tempAudio.duration || 0;
      resolve();
    });
  }));

  Promise.all(promises).then(() => {
    totalTrackDuration = track.musicDurations.reduce((a, b) => a + b, 0);
    total_duration.textContent = formatTime(totalTrackDuration);
  });

  if (coverEl) coverEl.style.backgroundImage = `url("${track.img}")`;

  track_name.textContent = track.name;
  track_name.href = track.url;
  track_name.target = "_blank";

  track_artist.textContent = track.artist;
  track_artist.href = track.artistUrl;
  track_artist.target = "_blank";

  now_playing.textContent = `Playing ${track_index + 1} of ${music_list.length}`;
  updateTimer = setInterval(setUpdate, 1000);
}

/* Update time/slider */
function setUpdate() {
  if (isNaN(curr_track.duration)) return;

  const track = music_list[track_index];
  let currentOverall = curr_track.currentTime;

  for (let i = 0; i < part_index; i++) {
    currentOverall += track.musicDurations[i] || 0;
  }

  const seekPosition = (currentOverall / totalTrackDuration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(currentOverall);
  total_duration.textContent = formatTime(totalTrackDuration);
}

/* Next part or track */
function nextPartOrTrack() {
  const track = music_list[track_index];
  if (part_index < track.music.length - 1) {
    part_index++;
    curr_track.src = track.music[part_index];
    curr_track.load();
    playTrack();
  } else {
    part_index = 0;
    if (isRandom) {
      let randIndex;
      do { randIndex = Math.floor(Math.random() * music_list.length); }
      while (randIndex === track_index);
      loadTrack(randIndex);
    } else {
      loadTrack(track_index + 1);
    }
    playTrack();
  }
}

/* Play / Pause */
function playTrack() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  curr_track.play().catch(e => console.error("Play failed:", e));
  isPlaying = true;

  if (vinylContainerEl && vinylEl) {
    vinylContainerEl.classList.remove('return', 'sliding');
    vinylEl.classList.remove('spinning');
    void vinylContainerEl.offsetWidth;
    vinylContainerEl.classList.add('sliding');
    vinylContainerEl.addEventListener('transitionend', () => {
      vinylContainerEl.classList.remove('sliding');
      vinylEl.classList.add('spinning');
    }, { once: true });
  }

  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
  if (loader) loader.classList.add('visible');
}

function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  if (vinylContainerEl && vinylEl) {
    vinylContainerEl.classList.remove('sliding');
    vinylEl.classList.remove('spinning');
    void vinylContainerEl.offsetWidth;
    vinylContainerEl.classList.add('return');
  }

  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
  if (loader) loader.classList.remove('visible');
}

function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}

/* Seek */
function seekTo() {
  const track = music_list[track_index];
  if (!totalTrackDuration) return;

  const targetOverall = (seek_slider.value / 100) * totalTrackDuration;

  let accumulated = 0;
  for (let i = 0; i < track.musicDurations.length; i++) {
    if (targetOverall < accumulated + track.musicDurations[i]) {
      part_index = i;
      curr_track.src = track.music[part_index];
      curr_track.load();
      curr_track.currentTime = targetOverall - accumulated;
      if (isPlaying) playTrack();
      break;
    }
    accumulated += track.musicDurations[i];
  }
}

/* Volume */
function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

/* Button handlers */
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
    nextPartOrTrack();
  }
});

playpause_btn.addEventListener('click', playpauseTrack);
next_btn.addEventListener('click', nextPartOrTrack);
prev_btn.addEventListener('click', () => {
  if (curr_track.currentTime > 3 || part_index === 0) {
    loadTrack(track_index - 1);
  } else {
    part_index--;
    curr_track.src = music_list[track_index].music[part_index];
    curr_track.load();
  }
  playTrack();
});

seek_slider.addEventListener('input', seekTo);
volume_slider.addEventListener('input', setVolume);

/* Init */
loadTrack(track_index);
