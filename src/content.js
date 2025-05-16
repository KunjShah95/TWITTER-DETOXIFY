/**
 * Twitter Detoxifier - Content filtering module
 * Handles filtering tweets by keywords, usernames, and media types
 */
let blockedKeywords = [];
let blockedUsernames = [];
let contentFilters = { hideImages: false, hideVideos: false };

// Initialize or load stats
let detoxStats = { keywords: 0, users: 0, images: 0, videos: 0 };
chrome.storage.local.get(['detoxStats'], (result) => {
    if (result.detoxStats) {
        detoxStats = result.detoxStats;
    }
});

// Function to save stats to storage (with a debounce to avoid too many writes)
let saveStatsTimeout = null;

function saveDetoxStats() {
    clearTimeout(saveStatsTimeout);
    saveStatsTimeout = setTimeout(() => {
        chrome.storage.local.set({ detoxStats: detoxStats });
    }, 1000); // Save stats after 1 second of no changes
}

// Helper: Extract username from tweet more reliably
function extractUsername(tweet) {
    // Look for anchor tags that link to /username (should avoid /home, /explore, etc)
    let candidates = [...tweet.querySelectorAll('a[href^="/"]')].filter(a =>
        a.getAttribute('href').match(/^\/[A-Za-z0-9_]+$/)
    );
    if (candidates.length === 0) return "";
    
    // Prefer ones with 'dir=ltr', but fallback if not found
    let userLink = candidates.find(a => a.getAttribute('dir') === 'ltr') || candidates[0];
    let match = userLink.getAttribute('href').match(/^\/([A-Za-z0-9_]+)$/);
    return match ? match[1] : "";
}

// Improved function to filter tweets with better accuracy
function filterTweets() {
    // If no filters are active, ensure all tweets are visible
    if (blockedKeywords.length === 0 && blockedUsernames.length === 0 && 
        !contentFilters.hideImages && !contentFilters.hideVideos) {
        document.querySelectorAll('article[data-testid="tweet"].detox-hidden-tweet').forEach(tweet => {
            tweet.classList.remove('detox-hidden-tweet');
        });
        return;
    }

    // Twitter's structure changes, this selector might need updates
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');

    tweets.forEach(tweet => {
        // Check ALL tweets each time, don't rely on .detox-processed flag
        let shouldHide = false;
        let blockedBy = "";

        // --- Check for blocked keywords ---
        const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
        const tweetText = tweetTextElement ? (tweetTextElement.textContent || tweetTextElement.innerText || "") : "";
        
        if (blockedKeywords.some(keyword => tweetText.toLowerCase().includes(keyword.toLowerCase()))) {
            shouldHide = true;
            blockedBy = "keyword";
            detoxStats.keywords++;
        }

        // --- Check for blocked users ---
        if (!shouldHide) {
            const username = extractUsername(tweet);
            if (username && blockedUsernames.some(user => username.toLowerCase() === user.toLowerCase())) {
                shouldHide = true;
                blockedBy = "user";
                detoxStats.users++;
            }
        }

        // --- Check for content types (images/videos) ---
        if (!shouldHide && contentFilters.hideImages) {
            if (tweet.querySelector('div[data-testid="tweetPhoto"], div[data-testid="GifPlayer"] img, img[alt="Image"], img[alt*="Embedded image"]')) {
                shouldHide = true;
                blockedBy = "image";
                detoxStats.images++;
            }
        }
        
        if (!shouldHide && contentFilters.hideVideos) {
            if (tweet.querySelector('div[data-testid="videoPlayer"], div[data-testid="VideoPlayer"], video')) {
                shouldHide = true;
                blockedBy = "video";
                detoxStats.videos++;
            }
        }

        // Apply hiding or show the tweet
        if (shouldHide) {
            tweet.classList.add('detox-hidden-tweet');
            saveDetoxStats(); // Save updated stats when we hide something
        } else {
            tweet.classList.remove('detox-hidden-tweet');
        }
    });
}

// Load initial settings and start filtering
chrome.storage.local.get(['blockedKeywords', 'blockedUsernames', 'contentFilters', 'detoxStats'], (result) => {
    if (result.blockedKeywords && Array.isArray(result.blockedKeywords)) {
        blockedKeywords = result.blockedKeywords;
    }
    if (result.blockedUsernames && Array.isArray(result.blockedUsernames)) {
        blockedUsernames = result.blockedUsernames;
    }
    if (result.contentFilters) {
        contentFilters = result.contentFilters;
    }
    if (result.detoxStats) {
        detoxStats = result.detoxStats;
    }
    filterTweets();
});

// Listen for updates from the popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let needsReFilter = false;
    if (message.action === 'updateKeywords') {
        blockedKeywords = message.keywords || [];
        needsReFilter = true;
    }
    if (message.action === 'updateBlockedUsers') {
        blockedUsernames = message.blockedUsernames || [];
        needsReFilter = true;
    }
    if (message.action === 'updateContentFilters') {
        contentFilters = message.contentFilters || { hideImages: false, hideVideos: false };
        needsReFilter = true;
    }
    // Listen for messages to get current stats from popup
    if (message.action === 'getDetoxStats') {
        sendResponse(detoxStats);
    }
    // Listen for message to reset stats from popup
    if (message.action === 'resetDetoxStats') {
        detoxStats = { keywords: 0, users: 0, images: 0, videos: 0 };
        saveDetoxStats(); // Save the reset stats
        sendResponse({ success: true });
    }

    if (needsReFilter) {
        filterTweets(); // Re-filter with new keywords or users
    }

    // Listener for timer-based blocking (to re-enable scrolling if unblocked)
    if (message.action === 'twitterTimerBlockStatus') {
        if (message.isBlocked) {            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            document.body.style.overflow = 'auto'; // Allow scrolling
        }
    }
});

// Twitter loads content dynamically, so we need to observe changes const userLink = tweet.querySelector('a[href*="/"][dir="ltr"]');
if (userLink) {
    const usernameFromTweet = userLink.getAttribute('href').split('/')[1];
    if (blockedUsernames.some(user => usernameFromTweet.toLowerCase() === user.toLowerCase())) {
        shouldHide = true;
    }
} DOM
const observer = new MutationObserver(() => {
    clearTimeout(saveStatsTimeout);
    saveStatsTimeout = setTimeout(() => {
        filterTweets();
    }, 300); // Debounce filtering to avoid excessive calls
});

// Start observing the body for configured mutations
observer.observe(document.body, { childList: true, subtree: true });

// Initial filter run in case content is already there
filterTweets();

console.log("Twitter Detoxifier content script loaded with improved filtering.");
