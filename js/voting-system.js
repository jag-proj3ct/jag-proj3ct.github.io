// js/voting-system.js

// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL HERE
// FIX: Updated to the LATEST DEPLOYMENT URL
const SCRIPT_URL = "https://script.google.com/a/macros/fpsmail.org/s/AKfycbwJGVn6iktN7k1wfqBVHSiJ6w89X-KNa2d8INWxx0xZOrSsSR0PO1rwyb1V5ZjLL5UGOQ/exec"; 
const VOTE_KEY = "hasVotedDomingo";

// Check if the DOM elements are available (important when deferring script)
const voteBtn = document.getElementById("voteBtn");
const votesDisplay = document.getElementById("currentVotes");
const voteMessage = document.getElementById("voteMessage");

if (voteBtn && votesDisplay && voteMessage) {
    // 1. Fetch current votes on load
    async function fetchVotes() {
      try {
        const cacheBuster = new Date().getTime();
        const response = await fetch(`${SCRIPT_URL}?cb=${cacheBuster}`, { method: 'GET' });
        const count = await response.text();
        votesDisplay.textContent = count;
      } catch (error) {
        console.error("Error fetching votes:", error);
        votesDisplay.textContent = "Error";
      }
    }

    // 2. Check if the user has already voted
    function checkVotedStatus() {
      if (localStorage.getItem(VOTE_KEY) === "true") {
        voteBtn.disabled = true;
        voteBtn.textContent = "Voted!";
        voteMessage.style.display = 'block';
      } else {
        voteBtn.disabled = false;
        voteBtn.textContent = "Vote Domingo!";
        voteMessage.style.display = 'none';
      }
    }

    // 3. Handle the one-time vote
    async function handleVote() {
      if (localStorage.getItem(VOTE_KEY) === "true") return; 

      voteBtn.disabled = true;
      voteBtn.textContent = "Submitting...";

      try {
        const response = await fetch(SCRIPT_URL, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        const newCount = await response.text();
        votesDisplay.textContent = newCount;

        localStorage.setItem(VOTE_KEY, "true");
        checkVotedStatus();

      } catch (error) {
        console.error("Error submitting vote:", error);
        alert("Failed to cast vote. Please try again later.");
        checkVotedStatus(); 
      }
    }

    // Initial load calls
    fetchVotes();
    checkVotedStatus();
    voteBtn.addEventListener("click", handleVote);

} else {
    console.error("Voting system elements not found in HTML. Check IDs.");
}
