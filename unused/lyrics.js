const lyricsDisplay = document.getElementById('lyrics-display');
const curr_track = document.querySelector('audio'); // Need to export this or find another way to access it

// This would be an array of objects for each song with timestamped lyrics
const allLyrics = [
    {
        name: "We Don't Care",
        lyrics: [
            { time: 5, text: "Wait a minute, wait a minute..." },
            { time: 10, text: "Y'all don't want no problems..." }
            // ... more lyrics and timestamps
        ]
    }
];

function updateLyrics() {
    if (!curr_track || !curr_track.duration) return;

    const currentTime = curr_track.currentTime;
    const currentSong = music_list[track_index]; // Assuming music_list is accessible

    const lyricsData = allLyrics.find(song => song.name === currentSong.name);
    if (!lyricsData) {
        lyricsDisplay.textContent = "Lyrics not available.";
        return;
    }

    let currentLyric = "♪ No lyrics yet ♪";
    for (const line of lyricsData.lyrics) {
        if (currentTime >= line.time) {
            currentLyric = line.text;
        } else {
            break; // Stop looking once we pass the current time
        }
    }
    lyricsDisplay.textContent = currentLyric;
}

// Listen for time updates on the audio element to trigger lyric changes
curr_track.addEventListener('timeupdate', updateLyrics);

