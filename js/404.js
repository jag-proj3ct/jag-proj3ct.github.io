/**
 * Asynchronously checks if a URL returns a successful status (200-299).
 * @param {string} url The URL to check.
 * @returns {Promise<boolean>} True if the URL is valid, false otherwise.
 */
async function checkUrlExists(url) {
  try {
    // We use the 'HEAD' method for efficiency; it only fetches the headers,
    // not the entire page content.
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache' // Prevents using a stale, potentially invalid, cached response
    });
    
    // Check if the status is in the 200-299 range (Success)
    return response.ok; 
  } catch (error) {
    // This catches network errors (e.g., DNS error, offline),
    // which also indicates the link is not reachable.
    console.error('Network or CORS error while checking URL:', url, error);
    return false;
  }
}

/**
 * Attaches a click event listener to all specified links 
 * to check their existence before navigation.
 * @param {string} selector The CSS selector for the links to monitor.
 * @param {string} fallbackUrl The URL to redirect to if the link is invalid.
 */
function setupLinkChecker(selector, fallbackUrl) {
  const links = document.querySelectorAll(selector);

  links.forEach(link => {
    // Only proceed if the link has a valid href that isn't just '#'
    const href = link.getAttribute('href');
    if (!href || href === '#') {
      return; // Skip links without an actual target or temporary '#'
    }

    link.addEventListener('click', async function(event) {
      // Prevent the default navigation immediately
      event.preventDefault(); 
      
      const targetUrl = this.href;

      // Check if the URL exists
      const exists = await checkUrlExists(targetUrl);
      
      if (exists) {
        // If the URL exists, navigate the user to it
        window.location.href = targetUrl;
      } else {
        // If the URL does not exist, redirect to the 404 page
        console.warn(`Link target not found: ${targetUrl}. Redirecting to ${fallbackUrl}`);
        window.location.href = fallbackUrl;
      }
    });
  });
}

// --- INITIALIZATION ---
// Select all anchor tags (<a>) that have an 'href' and 
// are NOT already handled by the music player (e.g., track name/artist links 
// which are temporarily set to '#') or are part of the 'footer' or 'profile-card'.
// You can adjust the selector to be more specific if needed.
const linksToMonitor = 'a[href]:not(.track-name):not(.track-artist):not([href="#"]):not(a[href^="mailto:"])';
const custom404Page = '404.html';

document.addEventListener('DOMContentLoaded', () => {
    // Apply the link checking logic to the specified links
    setupLinkChecker(linksToMonitor, custom404Page);
});
