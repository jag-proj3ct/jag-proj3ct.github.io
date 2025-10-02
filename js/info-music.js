/* DOM references (info page specific) */
const now_playing = document.querySelector('.now-playing');
const track_art = document.querySelector('.track-art.info');
const coverEl = track_art.querySelector('.cover.info');

// Wrap cover in <a>
const coverLink = document.createElement("a");
coverLink.href = "https://open.spotify.com/album/4Uv86qWpGTxf7fU7lG5X6F?si=RBqk80_JSdeYhWqnFBrmrQ";
coverLink.target = "_blank";
coverLink.classList.add("cover-link");
coverLink.appendChild(coverEl.cloneNode(true));
track_art.replaceChild(coverLink, coverEl);

// Vinyl elements (not present in info.html but kept for compatibility)
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

/* Helper: Time Formatting */
function formatTime(sec) {
  const min = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${min.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// --- MUSIC LIST ---
const basePath = "../music/";
const coverDefault = "../images/college-dropout-cover.jpg";
const kanyeSpotify = "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x";

const original_music_list = [
  { 
    name: "Beauty and the Beast", 
    file: "batb.mp3", 
    url: "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x" 
  }
];

// Flatten into playable list
let flat_music_list = [];
original_music_list.forEach((track, originalIndex) => {
  if (track.file === "#") return;
  const musicFiles = Array.isArray(track.file) ? track.file : [track.file];
  
  const currentMusic = musicFiles.map((file, part) => ({
    name: track.name,
    artist: "Kanye West",
    url: track.url || kanyeSpotify,
    artistUrl: kanyeSpotify,
    img: coverDefault,
    musicSrc: basePath + file,
    isMultiPart: musicFiles.length > 1,
    partIndex: part,
    originalIndex: originalIndex,
    lastPartIndex: musicFiles.length - 1
  }));
  
  flat_music_list = flat_music_list.concat(currentMusic);
});

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

  if (index < 0) index = flat_music_list.length - 1;
  else if (index >= flat_music_list.length) index = 0;

  track_index = index;
  const track = flat_music_list[track_index];

  curr_track.src = track.musicSrc;
  curr_track.load();

  curr_track.onloadedmetadata = () => {
    total_duration.textContent = formatTime(curr_track.duration);
    const totalSongs = original_music_list.filter(t => t.file !== "#").length;
    let songNumber = 0;
    for (let i = 0; i <= track_index; i++) {
      if (flat_music_list[i].partIndex === 0) songNumber++;
    }
    let nowPlayingText = `Playing ${songNumber} of ${totalSongs}`;
    if (track.isMultiPart) {
      nowPlayingText += ` (${track.name} - Part ${track.partIndex + 1}/${track.lastPartIndex + 1})`;
    }
    now_playing.textContent = nowPlayingText;
  };

  const cover = coverLink.querySelector(".cover.info");
  if (cover) cover.style.backgroundImage = `url("${track.img}")`;

  track_name.textContent = track.name;
  track_name.href = track.url;
  track_artist.textContent = track.artist;
  track_artist.href = track.artistUrl;

  updateTimer = setInterval(setUpdate, 1000);
}

function setUpdate() {
  if (isNaN(curr_track.duration)) return;
  const seekPosition = (curr_track.currentTime / curr_track.duration) * 100;
  seek_slider.value = seekPosition;
  curr_time.textContent = formatTime(curr_track.currentTime);
}

/* Core player functions (play, pause, next, prev, repeat, random)... */
/* --- keep the rest of your original JS logic exactly the same --- */

