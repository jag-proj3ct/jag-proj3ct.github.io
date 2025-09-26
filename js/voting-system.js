// js/voting-system.js

// Your deployed Google Apps Script URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyx1pB3AbeDIaWFxDANrrEWY2NkgNmRYB3k_aNR109pR5aEVExaWniEc5-oZ0D2xy6FXw/exec";

// LocalStorage key so each browser only votes once
const VOTE_KEY = "hasVotedDomingo";

// Grab HTML elements
const voteBtn = document.getElementById("voteBtn");
const votesDisplay = document.getElementById("currentVotes");
const voteMessage = document.getElementById("voteMessage");

if (voteBtn && votesDisplay && voteMessage) {

  let refreshInterval;

  // Fetch current votes from Google Script
  async function fetchVotes() {
    try {
      const cacheBuster = Date.now();
      const response = await fetch(`${SCRIPT_URL}?cb=${cacheBuster}`, { method: "GET" });
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

  // Update button + message depending on vote status
  function checkVotedStatus() {
    if (localStorage.getItem(VOTE_KEY) === "true") {
      voteBtn.disabled = true;
      voteBtn.textContent = "Voted!";
      voteBtn.classList.add("voted");
      voteMessage.style.display = "block";
    } else {
      voteBtn.disabled = false;
      voteBtn.textContent = "Vote For Domingo!";
      voteBtn.classList.remove("voted");
      voteMessage.style.display = "none";
    }
  }

  // Handle button click → submit vote
  async function handleVote() {
    if (localStorage.getItem(VOTE_KEY) === "true") return;

    clearInterval(refreshInterval); // pause refreshing while voting
    voteBtn.disabled = true;
    voteBtn.textContent = "Submitting...";

    try {
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
      refreshInterval = setInterval(fetchVotes, 500); // resume auto-refresh
    }
  }

  // Initialize
  fetchVotes();
  checkVotedStatus();
  voteBtn.addEventListener("click", handleVote);

  // Live updates every 0.5s
  refreshInterval = setInterval(fetchVotes, 500);

} else {
  console.error("Voting system elements not found in HTML. Check IDs.");
}
