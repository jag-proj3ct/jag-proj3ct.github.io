// js/voting-system.js

// Current deployment URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz3gGvMYhLprAddC98Ynlr8dDzxYxJ_NjwJDoOYJg05nW-SIhKdSSicUq-LZE5H4vldcQ/exec";

// Previous deployments (keep for reference)
// const SCRIPT_URL = "...";

const VOTE_KEY = "hasVotedDomingo";

const voteBtn = document.getElementById("voteBtn");
const votesDisplay = document.getElementById("currentVotes");
const voteMessage = document.getElementById("voteMessage");

if (voteBtn && votesDisplay && voteMessage) {
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

    // 2. Check vote status
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

    // 3. Handle voting
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
      }
    }

    // Init
    fetchVotes();
    checkVotedStatus();
    voteBtn.addEventListener("click", handleVote);

    // Auto-refresh votes every 5 seconds
    setInterval(fetchVotes, 5000);

} else {
    console.error("Voting system elements not found in HTML. Check IDs.");
}
