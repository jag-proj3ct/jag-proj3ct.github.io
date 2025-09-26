/* DOM references */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
const coverEl = track_art.querySelector('.cover');

// 🎯 FIX: Reference the vinyl container and the inner vinyl element for correct animation
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

/* Web Audio API setup */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* Visualizer rendering */
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
      // 🎯 FIX: Use 'scaleY' which is what your CSS animation references
      stroke.style.transform = `scaleY(${Math.max(0.2, value * 1.2)})`;
    });
  } else {
    loader.classList.remove('visible');
    strokes.forEach(stroke => {
      stroke.style.transform = 'scaleY(0.2)';
    });
  }
}
if (loader) renderWave();

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

/* Format MM:SS */
function formatTime(time) {
  const minutes = Math.floor(time / 60) || 0;
  const seconds = Math.floor(time % 60) || 0;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/* Update time/slider */
function setUpdate() {
  if (isNaN(curr_track.duration)) return;

  const seekPosition = (curr_track.currentTime / curr_track.duration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(curr_track.currentTime);
  total_duration.textContent = formatTime(curr_track.duration);
}

/* Reset UI */
function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

/* Load track */
function loadTrack(index) {
  clearInterval(updateTimer);
  reset();

  // Wrap around
  if (index < 0) index = music_list.length - 1;
  else if (index >= music_list.length) index = 0;

  track_index = index;
  part_index = 0; // Start at the first part of the track
  const track = music_list[track_index];

  curr_track.src = track.music[part_index];
  curr_track.load();

  if (coverEl) coverEl.style.backgroundImage = `url("${track.img}")`;
  track_name.textContent = track.name;
  track_artist.textContent = track.artist;
  now_playing.textContent = `Playing ${track_index + 1} of ${music_list.length}`;

  updateTimer = setInterval(setUpdate, 1000);
}

// Function to handle moving to the next part or next track
function nextPartOrTrack() {
    const track = music_list[track_index];
    
    // Check if there is a next part in the current track
    if (part_index < track.music.length - 1) {
        part_index++;
        curr_track.src = track.music[part_index];
        curr_track.load();
        playTrack();
    } 
    // If this is the last part, move to the next track in the playlist
    else {
        // This is the end of the full track
        part_index = 0; 
        
        if (isRandom) {
            let randIndex;
            do {
              randIndex = Math.floor(Math.random() * music_list.length);
            } while (randIndex === track_index); // avoid same track twice
            loadTrack(randIndex);
            playTrack();
        } else {
            loadTrack(track_index + 1);
            playTrack();
        }
    }
}

/* Play track */
function playTrack() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  curr_track.play().catch(e => console.error("Play failed:", e));
  isPlaying = true;

  // 🎯 FIX: Apply sliding and spinning classes to the vinyl container and inner vinyl
  if (vinylContainerEl && vinylEl) {
    vinylContainerEl.classList.remove('return', 'sliding');
    vinylEl.classList.remove('spinning'); // Remove spinning from the inner element

    void vinylContainerEl.offsetWidth; // force reflow
    vinylContainerEl.classList.add('sliding');

    // Start spinning after the slide transition ends
    vinylContainerEl.addEventListener('transitionend', () => {
      vinylContainerEl.classList.remove('sliding');
      vinylEl.classList.add('spinning');
    }, { once: true });
  }

  // track_art.classList.add('playing'); // Not strictly needed based on CSS
  playpause_btn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';
  if (loader) loader.classList.add('visible');
}

/* Pause track */
function pauseTrack() {
  curr_track.pause();
  isPlaying = false;

  // 🎯 FIX: Apply return class to the vinyl container and stop spinning on the inner vinyl
  if (vinylContainerEl && vinylEl) {
    vinylContainerEl.classList.remove('sliding');
    vinylEl.classList.remove('spinning');
    void vinylContainerEl.offsetWidth;
    vinylContainerEl.classList.add('return');
  }

  // track_art.classList.remove('playing'); // Not strictly needed based on CSS
  playpause_btn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
  if (loader) loader.classList.remove('visible');
}

/* Toggle play/pause */
function playpauseTrack() {
  isPlaying ? pauseTrack() : playTrack();
}

/* Seek */
function seekTo() {
  if (!curr_track.duration) return;
  curr_track.currentTime = curr_track.duration * (seek_slider.value / 100);
}

/* Volume */
function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

/* Toggle repeat */
repeat_btn.addEventListener('click', () => {
  isRepeating = !isRepeating;
  // 🎯 FIX: Use the .active class defined in your CSS for the styling
  repeat_btn.classList.toggle('active', isRepeating);
});

/* Toggle random */
random_btn.addEventListener('click', () => {
  isRandom = !isRandom;
  // 🎯 FIX: Use the .active class defined in your CSS for the styling
  random_btn.classList.toggle('active', isRandom);
});


/* Track part end */
curr_track.addEventListener('ended', () => {
  if (isRepeating) {
    curr_track.currentTime = 0;
    playTrack();
  } else {
    // Check for next part/track
    nextPartOrTrack();
  }
});

/* Controls */
playpause_btn.addEventListener('click', playpauseTrack);

next_btn.addEventListener('click', () => {
  const track = music_list[track_index];
  
  // If there are multiple parts, move to the next part first (which nextPartOrTrack handles)
  // Otherwise, nextPartOrTrack handles moving to the next *track* (random or sequential)
  nextPartOrTrack();
});

prev_btn.addEventListener('click', () => {
  // If we are past the first part, restart current part OR if it's the very beginning of the first part, go to prev track
  if (curr_track.currentTime > 3 || part_index === 0) {
      loadTrack(track_index - 1);
  } else {
      // Go back to the previous part
      part_index--;
      curr_track.src = music_list[track_index].music[part_index];
      curr_track.load();
  }
  playTrack();
});

seek_slider.addEventListener('input', seekTo);
volume_slider.addEventListener('input', setVolume);

/* Initial */
loadTrack(track_index);
