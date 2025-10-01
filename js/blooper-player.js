// DOM references
const video = document.getElementById("myVideo");
const bufferVideo = document.createElement("video"); // hidden preloader
bufferVideo.muted = true;
bufferVideo.style.display = "none";
document.body.appendChild(bufferVideo);

const playPauseBtn = document.getElementById("playPauseBtn");
const muteBtn = document.getElementById("muteBtn");
const seekBar = document.getElementById("seekBar");
const volumeBar = document.getElementById("volumeBar");
const currentTimeEl = document.getElementById("currentTime");
const totalTimeEl = document.getElementById("totalTime");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const videoControls = document.querySelector(".video-controls");

// Title element
const videoTitleEl = document.getElementById("videoTitle");

// VIDEO LIST
const basePath = "/videos/";
const errorVideoPath = "/videos/404placeholder.mp4";

const original_video_list = [
  { name: "at school recording", file: "vidskl" },
  { name: "home (kod) 1", file: "homerec" },
  { name: "home (kod) 2", file: "homerec2" },
  { name: "reading script counter", file: "scriptcount" },
  { name: "mess ups", file: "vidoops" }
];

let flat_video_list = [];
original_video_list.forEach((vid, originalIndex) => {
  const videoFiles = Array.isArray(vid.file) ? vid.file : [vid.file];
  flat_video_list.push({
    name: vid.name,
    files: videoFiles.map(file => basePath + file),
    currentPart: 0,
    originalIndex
  });
});

let video_index = 0;

// Helper: Format time
function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  const min = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${min.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
}

// Load video sources into a <video> element
function loadVideoElement(target, index, part = 0) {
  target.innerHTML = "";
  const track = flat_video_list[index];
  const baseFile = track.files[part];

  const sourceMP4 = document.createElement("source");
  sourceMP4.src = baseFile + ".mp4";
  sourceMP4.type = "video/mp4";
  target.appendChild(sourceMP4);

  const sourceMOV = document.createElement("source");
  sourceMOV.src = baseFile + ".mov";
  sourceMOV.type = "video/quicktime";
  target.appendChild(sourceMOV);

  target.load();
}

// Show 404 video
function loadErrorVideo(target, loop = true, nextAction = null) {
  target.innerHTML = "";

  const source404 = document.createElement("source");
  source404.src = errorVideoPath;
  source404.type = "video/mp4";
  target.appendChild(source404);

  target.loop = loop;
  target.load();
  videoTitleEl.textContent = "404 File Not Found";

  // if one-off (not loop), trigger next action on ended
  if (!loop && typeof nextAction === "function") {
    target.onended = nextAction;
  }

  target.play().catch(() => {});
}

// Main Loader
function loadVideo(index, part = 0) {
  video_index = index;
  flat_video_list[index].currentPart = part;
  loadVideoElement(video, index, part);

  video.onerror = () => {
    const track = flat_video_list[index];
    console.warn("Video not found:", track.files[part]);

    if (track.files.length === 1) {
      // Single file → loop 404
      loadErrorVideo(video, true);
    } else {
      // Multi-part → play 404 once, then skip to next
      loadErrorVideo(video, false, () => {
        track.currentPart++;
        if (track.currentPart < track.files.length) {
          swapToBuffer(index, track.currentPart);
        } else {
          video_index++;
          if (video_index >= flat_video_list.length) video_index = 0;
          flat_video_list[video_index].currentPart = 0;
          swapToBuffer(video_index, 0);
        }
      });
    }
  };

  // update <h1>
  const trackName = flat_video_list[index].name;
  videoTitleEl.textContent = trackName.charAt(0).toUpperCase() + trackName.slice(1);

  preloadNext(index, part);
}

// Preload next video/part
function preloadNext(index, part) {
  const track = flat_video_list[index];
  if (part < track.files.length - 1) {
    loadVideoElement(bufferVideo, index, part + 1);
  } else if (index < flat_video_list.length - 1) {
    loadVideoElement(bufferVideo, index + 1, 0);
  }

  bufferVideo.onerror = () => {
    console.warn("Preload failed, skipping preload...");
  };
}

// Swap to buffer
function swapToBuffer(index, part) {
  const wasMuted = video.muted;
  const vol = video.volume;

  loadVideoElement(video, index, part);

  video.onerror = () => {
    const track = flat_video_list[index];
    console.warn("Swap failed:", track.files[part]);

    if (track.files.length === 1) {
      loadErrorVideo(video, true);
    } else {
      loadErrorVideo(video, false, () => {
        track.currentPart++;
        if (track.currentPart < track.files.length) {
          swapToBuffer(index, track.currentPart);
        } else {
          video_index++;
          if (video_index >= flat_video_list.length) video_index = 0;
          flat_video_list[video_index].currentPart = 0;
          swapToBuffer(video_index, 0);
        }
      });
    }
  };

  video.volume = vol;
  video.muted = wasMuted;
  video.play().catch(() => {});

  preloadNext(index, part);

  const trackName = flat_video_list[index].name;
  videoTitleEl.textContent = trackName.charAt(0).toUpperCase() + trackName.slice(1);
}

// On video ended → swap instantly
video.addEventListener("ended", () => {
  const track = flat_video_list[video_index];

  if (track.currentPart < track.files.length - 1) {
    track.currentPart++;
    swapToBuffer(video_index, track.currentPart);
  } else {
    video_index++;
    if (video_index >= flat_video_list.length) video_index = 0;
    flat_video_list[video_index].currentPart = 0;
    swapToBuffer(video_index, 0);
  }
});

// === Controls ===
function togglePlay() {
  if (video.paused || video.ended) video.play();
  else video.pause();
}
playPauseBtn.addEventListener("click", togglePlay);

video.addEventListener("play", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-pause"></i>';
});
video.addEventListener("pause", () => {
  playPauseBtn.innerHTML = '<i class="fa fa-play"></i>';
});

video.addEventListener("timeupdate", () => {
  if (!isNaN(video.duration)) {
    seekBar.value = (video.currentTime / video.duration) * 100;
    currentTimeEl.textContent = formatTime(video.currentTime);
  }
});
seekBar.addEventListener("input", () => {
  if (!isNaN(video.duration)) {
    video.currentTime = (seekBar.value/100)*video.duration;
  }
});

volumeBar.addEventListener("input", () => {
  video.volume = volumeBar.value;
});
muteBtn.addEventListener("click", () => {
  video.muted = !video.muted;
  muteBtn.innerHTML = video.muted
    ? '<i class="fa fa-volume-mute"></i>'
    : '<i class="fa fa-volume-up"></i>';
});

fullscreenBtn.addEventListener("click", () => {
  if (video.webkitEnterFullscreen) {
    video.webkitEnterFullscreen();
  } else if (document.fullscreenElement) {
    document.exitFullscreen();
  } else if (video.requestFullscreen) {
    video.requestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement === video) {
    video.classList.add("video-fullscreen");
    videoControls.classList.add("fullscreen-active");
  } else {
    video.classList.remove("video-fullscreen");
    videoControls.classList.remove("fullscreen-active");
  }
});

// Init
loadVideo(0, 0);
video.volume = volumeBar.value;
currentTimeEl.textContent = "00:00";
totalTimeEl.textContent = "00:00";
