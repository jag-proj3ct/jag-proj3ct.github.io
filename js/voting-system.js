// js/voting-system.js

// Current deployment URL (updated)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyx1pB3AbeDIaWFxDANrrEWY2NkgNmRYB3k_aNR109pR5aEVExaWniEc5-oZ0D2xy6FXw/exec";

const VOTE_KEY = "hasVotedDomingo";

const voteBtn = document.getElementById("voteBtn");
const votesDisplay = document.getElementById("currentVotes");
const voteMessage = document.getElementById("voteMessage");

if (voteBtn && votesDisplay && voteMessage) {

    let refreshInterval;

    // 1. Fetch current votes
    async function fetchVotes() {
        try {
            const cacheBuster = new Date().getTime();
            const response = await fetch(`${SCRIPT_URL}?cb=${cacheBuster}`, { method: 'GET' });
            const count = await response.text();

            if (isNaN(parseInt(count))) {
                throw new Error(`Script returned non-numeric data: ${count}`);
            }

            votesDisplay.textContent = count;
        } catch (error) {
            console.error("Error fetching votes:", error);
            votesDisplay.textContent = "Error";
        }
    }

    // 2. Check vote status and toggle voted class
    function checkVotedStatus() {
        if (localStorage.getItem(VOTE_KEY) === "true") {
            voteBtn.disabled = true;
            voteBtn.textContent = "Voted!";
            voteBtn.classList.add("voted"); // add grey style
            voteMessage.style.display = 'block';
        } else {
            voteBtn.disabled = false;
            voteBtn.textContent = "Vote Domingo!";
            voteBtn.classList.remove("voted"); // remove grey style
            voteMessage.style.display = 'none';
        }
    }

    // 3. Handle voting
    async function handleVote() {
        if (localStorage.getItem(VOTE_KEY) === "true") return;

        // Pause auto-refresh while voting
        clearInterval(refreshInterval);

        voteBtn.disabled = true;
        voteBtn.textContent = "Submitting...";

        try {
            const response = await fetch(SCRIPT_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ count: votesDisplay.textContent })
            });
            
            const newCount = await response.text();

            if (isNaN(parseInt(newCount))) {
                throw new Error(`Script returned non-numeric data: ${newCount}`);
            }

            votesDisplay.textContent = newCount;
            localStorage.setItem(VOTE_KEY, "true");
            checkVotedStatus();

        } catch (error) {
            console.error("Error submitting vote:", error);
            alert("Failed to cast vote. Please try again later.");
            checkVotedStatus(); 
        } finally {
            // Resume auto-refresh after voting
            refreshInterval = setInterval(fetchVotes, 500);
        }
    }

    // Init
    fetchVotes();
    checkVotedStatus();
    voteBtn.addEventListener("click", handleVote);

    // Auto-refresh votes every 0.5 seconds
    refreshInterval = setInterval(fetchVotes, 500);

} else {
    console.error("Voting system elements not found in HTML. Check IDs.");
}
