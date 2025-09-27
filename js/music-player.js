/* DOM references */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art');
const coverEl = track_art.querySelector('.cover');

// Wrap cover in <a>
const coverLink = document.createElement("a");
coverLink.href = "https://open.spotify.com/album/4Uv86qWpGTxf7fU7lG5X6F?si=RBqk80_JSdeYhWqnFBrmrQ";
coverLink.target = "_blank";
coverLink.classList.add("cover-link");
coverLink.appendChild(coverEl.cloneNode(true));
track_art.replaceChild(coverLink, coverEl);

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

// --- CRITICAL REMOVAL: part_index and totalTrackDuration are no longer needed for song duration ---

/* Helper: Time Formatting */
function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${min.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- MUSIC LIST RESTRUCTURING ---

const basePath = "./music/";
const coverDefault = "./images/college-dropout-cover.jpg";
const kanyeSpotify = "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x";

// 1. Define the original tracklist including the special multi-part track
const original_music_list = [
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
  { name: "Lil Jimmy (Skit)", file: "#", url: "https://open.spotify.com/track/4BhwlQ9mTwhFGXpQvP9JTV?si=5-7HNlqCTiiXqxtIn7ABjg" },
  { name: "Two Words", file: "2words.mp3", url: "https://open.spotify.com/track/62wtttQzoIA9HnNmGVd9Yq" },
  { name: "Through the Wire", file: "through-the-wire.mp3", url: "https://open.spotify.com/track/4mmkhcEm1Ljy1U9nwtsxUo" },
  { name: "Family Business", file: "family-business.mp3", url: "https://open.spotify.com/track/5DBmXF7QO43Cuy9yqva116" },
  // Multi-part song
  {
    name: "Last Call",
    file: ["lastcall1.mp3", "lastcall2.mp3", "lastcall3.mp3"],
    url: "https://open.spotify.com/track/7iOhWWYjhhQiXzF4o4HhXN"
  }
];

// 2. Flatten the list into a new array. Multi-part songs are chained together.
let flat_music_list = [];
original_music_list.forEach((track, originalIndex) => {
  // Handle unavailable tracks
  if (track.file === "#") return;

  // Normalize single and multi-part files into an array of music sources
  const musicFiles = Array.isArray(track.file) ? track.file : [track.file];
  
  // Track the original index and the part number
  let currentMusic = musicFiles.map((file, part) => ({
    // Inherit track details
    name: track.name,
    artist: "Kanye West",
    url: track.url || kanyeSpotify,
    artistUrl: kanyeSpotify,
    img: coverDefault,
    
    // File details
    musicSrc: basePath + file,
    
    // Chaining/Indexing details
    isMultiPart: musicFiles.length > 1,
    partIndex: part,
    originalIndex: originalIndex,
    lastPartIndex: musicFiles.length - 1
  }));
  
  flat_music_list = flat_music_list.concat(currentMusic);
});

// --- CORE PLAYER FUNCTIONS ---

/* Reset */
function reset() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

/* Load track */
function loadTrack(index) {
  clearInterval(updateTimer);
  reset();

  // Handle standard boundary conditions
  // NOTE: nextTrack/prevTrack handle the intentional wrap-around logic.
  if (index < 0) index = flat_music_list.length - 1;
  else if (index >= flat_music_list.length) index = 0;

  track_index = index;
  const track = flat_music_list[track_index];

  curr_track.src = track.musicSrc;
  curr_track.load();

  // Use 'loadedmetadata' to update duration/UI
  curr_track.onloadedmetadata = () => {
    // Only set duration once the metadata is loaded
    total_duration.textContent = formatTime(curr_track.duration);
    
    // Calculate total logical songs (21)
    const totalSongs = original_music_list.filter(t => t.file !== "#").length; // Should be 21
    
    // Find the current song number (1-based index of the logical song)
    // We count how many *first parts* (or single-part tracks) occur up to this track's original index.
    let songNumber = 0;
    for (let i = 0; i <= track_index; i++) {
        if (flat_music_list[i].partIndex === 0) {
            songNumber++;
        }
    }

    let nowPlayingText = `Playing ${songNumber} of ${totalSongs}`;
    if (track.isMultiPart) {
        nowPlayingText += ` (${track.name} - Part ${track.partIndex + 1}/${track.lastPartIndex + 1})`;
    }

    now_playing.textContent = nowPlayingText;
  };
  
  // Update UI elements
  const cover = coverLink.querySelector(".cover");
  if (cover) cover.style.backgroundImage = `url("${track.img}")`;

  track_name.textContent = track.name;
  track_name.href = track.url;
  track_name.target = "_blank";

  track_artist.textContent = track.artist;
  track_artist.href = track.artistUrl;
  track_artist.target = "_blank";

  updateTimer = setInterval(setUpdate, 1000);
}

/* Update time/slider */
function setUpdate() {
  if (isNaN(curr_track.duration)) return;

  const seekPosition = (curr_track.currentTime / curr_track.duration) * 100;
  seek_slider.value = seekPosition;

  curr_time.textContent = formatTime(curr_track.currentTime);
}

// --- MODIFIED NEXT/PREV TRACK FUNCTIONS ---

/* Next track logic (simplified for logical song jumps) */
function nextTrack() {
    const currentTrack = flat_music_list[track_index];
    let nextIndex = track_index + 1;

    // Determine the target index for the next logical song
    if (currentTrack.isMultiPart && currentTrack.partIndex < currentTrack.lastPartIndex) {
        // If they click next, jump over the remaining parts of this song
        // Find the index of the first part of the next song after the current one's original index
        nextIndex = flat_music_list.findIndex(t => t.originalIndex > currentTrack.originalIndex && t.partIndex === 0);
        
        // SPECIAL CASE: If not found, it means the current song (Last Call) is the last logical song.
        if (nextIndex === -1) {
            // Wrap around to Intro (Skit) which is flat_music_list index 0.
            nextIndex = 0;
        }
    } else if (track_index === flat_music_list.length - 1) {
        // If this is the very last part of the very last song (Last Call Part 3), wrap to Intro (Skit).
        nextIndex = 0;
    } else {
        // Regular next track
        nextIndex = track_index + 1;
    }
    
    // Handle random mode, ensuring we always start at the first part of a multi-part track
    if (isRandom) {
      let randIndex;
      // Do-while loop ensures a new track is selected (prevents playing the same track again)
      do {
        randIndex = Math.floor(Math.random() * flat_music_list.length);
      } while (randIndex === track_index);
      
      // Always find the *first part* of the randomly selected song
      randIndex = flat_music_list.findIndex(t => t.originalIndex === flat_music_list[randIndex].originalIndex && t.partIndex === 0);
      loadTrack(randIndex);

    } else {
        loadTrack(nextIndex);
    }
    
    playTrack();
}

/* Previous track logic (fixed for special wrap-around) */
function prevTrack() {
    const currentTrack = flat_music_list[track_index];

    if (curr_track.currentTime > 3 || (currentTrack.isMultiPart && currentTrack.partIndex > 0)) {
        // 1. Restart current track/part if played for more than 3 seconds
        // 2. Go back one part if it's a multi-part song and not the first part
        let prevPartIndex = track_index;
        if (currentTrack.isMultiPart && currentTrack.partIndex > 0) {
            prevPartIndex = track_index - 1;
        } else {
            curr_track.currentTime = 0;
            if (isPlaying) return; // If restarting, and playing, just continue playing
        }
        loadTrack(prevPartIndex);
        
    } else {
        // We are at the start of a song (partIndex === 0 or single-part)
        let prevIndex;

        // Find the index of the *first part* of the logically previous song
        let prevSongIndex = flat_music_list.findLastIndex(t => t.originalIndex < currentTrack.originalIndex && t.partIndex === 0);
        
        if (prevSongIndex !== -1) {
            // Found a previous song, now jump to its last part (for a full reverse experience)
            prevIndex = flat_music_list.findLastIndex(t => t.originalIndex === flat_music_list[prevSongIndex].originalIndex);
        } else {
            // Case 1: We are on the first song (Intro Skit, index 0).
            // Wrap around to "Family Business" (Track 21, originalIndex 20).
            // The index of "Family Business" is 20 in the flat_music_list.
            if (track_index === 0) {
                prevIndex = 20; 
            } else {
                // Should not happen, but as a fallback, wrap to the actual last item
                prevIndex = flat_music_list.length - 1; 
            }
        }
        
        loadTrack(prevIndex);
    }
    
    playTrack();
}
// --- END MODIFIED NEXT/PREV TRACK FUNCTIONS ---


/* Play / Pause */
function playTrack() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  curr_track.play().catch(e => console.error("Play failed:", e));
  isPlaying = true;

  if (vinylContainerEl && vinylEl) {
    vinylContainerEl.classList.remove('return', 'sliding');
    vinylEl.classList.remove('spinning');
    void vinylContainerEl.offsetWidth; // Force reflow
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
    void vinylContainerEl.offsetWidth; // Force reflow
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
  if (isNaN(curr_track.duration)) return;
  const seekTime = (seek_slider.value / 100) * curr_track.duration;
  curr_track.currentTime = seekTime;
}

/* Volume */
function setVolume() {
  curr_track.volume = volume_slider.value / 100;
}

/* Web Audio API & Visualizer setup */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const source = audioCtx.createMediaElementSource(curr_track);
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;

const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// --- MODIFIED VISUALIZER FUNCTION ---
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
      // MODIFIED: Reduced max multiplier (e.g., from 1.2 to 1.0) for smaller height
      stroke.style.transform = `scaleY(${Math.max(0.2, value * 1.0)})`; 
    });
  } else {
    loader.classList.remove('visible');
    strokes.forEach(stroke => stroke.style.transform = 'scaleY(0.2)');
  }
}
if (loader) renderWave();


// ===================================
// 🎺 CUPID & KEYBOARD SOUND FUNCTIONALITY 🎺
// ===================================

// --- Sound Playback Helper ---
/**
 * Creates and plays a specified trumpet sound file.
 * @param {string} fileName - The name of the MP3 file (e.g., 'trumpet1.mp3').
 */
function playTrumpetSound(fileName) {
    // A new Audio element is created each time to allow sounds to overlap.
    const trumpetAudio = new Audio(`/sounds/${fileName}`); 
    
    // Set the volume to the current player volume
    trumpetAudio.volume = curr_track.volume;

    // Play the sound, catching errors if playback fails
    trumpetAudio.play().catch(e => console.warn(`Trumpet sound failed to play: ${fileName}`, e));

    console.log(`Playing: ${fileName}`);
}

// --- Cupid Click Handler (Random Trumpet) ---

// 1. Get references to the cupid elements
const cupids = document.querySelectorAll('.cupid');

// 2. Define the sound files for RANDOM PLAYBACK
const randomTrumpetSounds = [
    'trumpet1.mp3',
    'trumpet2.mp3',
    'a-trumpet.mp3',
    'b-trumpet.mp3',
    'c-trumpet.mp3',
    'c2-trumpet.mp3',
    'd-trumpet.mp3',
    'e-trumpet-fixed.mp3', // Using the fixed name
    'f-trumpet.mp3',
    'g-trumpet.mp3'
];

function playRandomTrumpet() {
    // Choose a random sound index
    const randomIndex = Math.floor(Math.random() * randomTrumpetSounds.length);
    playTrumpetSound(randomTrumpetSounds[randomIndex]);
}

// 3. Add the click listener to all cupids
cupids.forEach(cupid => {
    cupid.style.pointerEvents = 'auto'; 
    cupid.addEventListener('click', playRandomTrumpet);
});


// --- Keyboard Handler (Specific Trumpet) ---

// Map number keys to specific trumpet files (assuming files exist in /sounds/ folder)
const keyTrumpetMap = {
    '1': 'trumpet1.mp3',
    '2': 'trumpet2.mp3',
    '3': 'a-trumpet.mp3',
    '4': 'b-trumpet.mp3',
    '5': 'c-trumpet.mp3',
    '6': 'c2-trumpet.mp3',
    '7': 'd-trumpet.mp3',
    '8': 'e-trumpet-fixed.mp3', // Using the fixed name
    '9': 'f-trumpet.mp3',
    '0': 'g-trumpet.mp3'
};

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const soundFile = keyTrumpetMap[key];

    // Check if the pressed key is one of the mapped trumpet keys
    if (soundFile) {
        // event.preventDefault(); 
        playTrumpetSound(soundFile);
    }
    
    // Optional: Add media controls for spacebar and arrow keys (common practice)
    if (key === ' ') {
        event.preventDefault(); // Stop spacebar from scrolling
        playpauseTrack();
    } else if (key === 'ArrowRight') {
        nextTrack();
    } else if (key === 'ArrowLeft') {
        prevTrack();
    }
});


// --- EVENT LISTENERS ---

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
    return;
  }
  
  const currentTrack = flat_music_list[track_index];
  
  // If this is a multi-part song and not the last part, go to the next part
  if (currentTrack.isMultiPart && currentTrack.partIndex < currentTrack.lastPartIndex) {
      loadTrack(track_index + 1);
      playTrack();
  } else {
      // Otherwise, go to the next logical song (handled by the regular nextTrack logic)
      // This will ensure that after Last Call Part 3, it wraps to Intro (Skit)
      nextTrack();
  }
});

playpause_btn.addEventListener('click', playpauseTrack);
next_btn.addEventListener('click', nextTrack);
prev_btn.addEventListener('click', prevTrack);

seek_slider.addEventListener('input', seekTo);
volume_slider.addEventListener('input', setVolume);
curr_track.volume = volume_slider.value / 100; // Set initial volume

/* Init */
// Ensure we start on a valid, first part of a song (Intro Skit)
loadTrack(flat_music_list.findIndex(t => t.partIndex === 0));
