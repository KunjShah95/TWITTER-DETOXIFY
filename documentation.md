# Twitter Detoxify - Project Documentation

## 1. Introduction

Twitter Detoxifier is a browser extension designed to give users greater control over their Twitter/X feed. In an online world that can often feel overwhelming or negative, this tool provides features to filter out unwanted content, manage browsing time, and ultimately create a more positive and focused social media experience.

This document provides an in-depth look at the extension's features, architecture, and usage.

## 2. Core Features

### 2.1. Site Blocker
*   **Purpose:** Helps users manage their time and reduce distractions by temporarily blocking access to Twitter/X.
*   **How it Works:**
    *   Users set a duration (hours and minutes) via the extension popup.
    *   The `background.js` script stores a `blockUntil` timestamp in `chrome.storage.local`.
    *   While active, `background.js` and `content.js` work together:
        *   If a user navigates to Twitter/X, `content.js` (or `background.js` by injecting a script) replaces the page content with a "Site Blocked" message.
        *   Scrolling is disabled on the blocked page.
    *   The block can be manually lifted using the "Unlock Site Now" button in the popup, which clears the `blockUntil` timestamp.
*   **Configuration:** Via the "Site Blocker" section in the extension popup.

### 2.2. Keyword Filtering
*   **Purpose:** Allows users to hide tweets containing specific words or phrases.
*   **How it Works:**
    *   Users list keywords (one per line) in the popup. These are saved to `chrome.storage.local`.
    *   `content.js`, running on Twitter/X pages, monitors the feed for new tweets.
    *   For each tweet, it checks if the tweet's text content (case-insensitive) contains any of the blocked keywords.
    *   If a match is found, the tweet element is hidden by adding the `detox-hidden-tweet` CSS class (defined in `content.css`).
    *   The count of keyword-filtered tweets is updated in `detoxStats`.
*   **Configuration:** Via the "Keyword Filtering" section in the popup.

### 2.3. User Blocking
*   **Purpose:** Enables hiding all tweets from specific user accounts.
*   **How it Works:**
    *   Users list usernames (one per line, without the "@" symbol) in the popup. These are saved to `chrome.storage.local`.
    *   `content.js` scans tweets to identify the author's username.
    *   If a tweet's author matches a username in the blocked list (case-insensitive), the tweet is hidden using the `detox-hidden-tweet` class.
    *   The count of user-blocked tweets is updated in `detoxStats`.
*   **Configuration:** Via the "User Blocking" section in the popup.

### 2.4. Content-Type Filtering
*   **Purpose:** Provides options to hide tweets based on the type of media they contain (images or videos).
*   **How it Works:**
    *   Users can toggle checkboxes in the popup to "Hide tweets with images" and/or "Hide tweets with videos". These settings are saved to `chrome.storage.local`.
    *   `content.js` inspects tweets for image (`<img>`, specific `div`s with `data-testid="tweetPhoto"`) or video (`<video>`, `div`s with `data-testid="videoPlayer"`) elements.
    *   If a tweet contains the selected media type to be hidden, it's concealed using the `detox-hidden-tweet` class.
    *   Counts for hidden images/videos are updated in `detoxStats`.
*   **Configuration:** Via the "Content Filtering" section in the popup.

### 2.5. Detoxification Summary
*   **Purpose:** Offers users a statistical overview of the extension's filtering activity.
*   **How it Works:**
    *   `content.js` maintains a `detoxStats` object (stored in `chrome.storage.local`) that counts:
        *   Tweets hidden due to keywords.
        *   Tweets hidden due to blocked users.
        *   Tweets hidden because they contained images (if the filter is active).
        *   Tweets hidden because they contained videos (if the filter is active).
    *   The popup retrieves these stats from `content.js` (via messaging if on an active Twitter tab) or directly from storage and displays them.
    *   Users can reset these statistics to zero.
*   **Configuration:** Viewed and managed in the "Detox Summary" section of the popup.

## 3. Installation and Setup

(Refer to the "Getting Started" section in `README.md` for detailed installation instructions.)

## 4. Usage Guide

1.  **Accessing the Extension:** Click the Twitter Detoxifier icon in your browser's toolbar. This will open the main popup interface.

2.  **Using the Site Blocker:**
    *   In the "Site Blocker" card, use the dropdowns to select the desired **Hours** and **Minutes** for the block.
    *   Click the **"Start Site Block"** button. A status message will confirm the block and show the remaining time.
    *   While active, navigating to Twitter/X will display a block page.
    *   To end the block early, open the popup and click **"Unlock Site Now"**.

3.  **Filtering by Keywords:**
    *   In the "Keyword Filtering" card, type or paste the keywords you want to filter, with **each keyword on a new line**.
    *   Click **"Save Keywords"**. Tweets containing these keywords will be hidden from your feed.
    *   The small "x" icon in the textarea can be used to clear the input field.

4.  **Blocking Users:**
    *   In the "User Blocking" card, enter the Twitter usernames you wish to block, **one username per line, without the "@" symbol** (e.g., `annoyingUser123`).
    *   Click **"Save Blocked Users"**. Tweets from these users will be hidden.
    *   The small "x" icon in the textarea can be used to clear the input field.

5.  **Filtering Content Types:**
    *   In the "Content Filtering" card, check the box for **"Hide tweets with images"** and/or **"Hide tweets with videos"** according to your preference.
    *   Click **"Apply Content Filters"**.

6.  **Viewing the Detox Summary:**
    *   The "Detox Summary" card displays the number of items filtered based on your current settings.
    *   If you wish to reset these counts, click the **"Reset Stats"** button.

**Note:** Filters are applied dynamically. You might need to scroll or refresh your Twitter/X feed for changes to take full effect on already loaded content.

## 5. Technical Architecture

The extension is composed of several key components:

*   **`manifest.json`**:
    *   Defines the extension's name, version, permissions, and entry points.
    *   **Permissions requested:**
        *   `storage`: To save user settings (keywords, blocked users, filter preferences, timer state, stats).
        *   `tabs`: To interact with browser tabs (e.g., query active tab, send messages).
        *   `scripting`: To inject content scripts into Twitter/X pages.
    *   **Host Permissions:** `*://twitter.com/*`, `*://x.com/*` to allow the extension to operate on these sites.
    *   Declares `background.js` as the service worker, `popup.html` as the action popup, and `content.js`/`content.css` as content scripts.

*   **`src/popup.html` & `src/popup.js`**:
    *   **`popup.html`**: Defines the HTML structure of the extension's user interface, styled with Tailwind CSS.
    *   **`popup.js`**: Handles all logic for the popup:
        *   Loading saved settings from `chrome.storage.local`.
        *   Saving user inputs (timer duration, keywords, blocked users, content filters) to `chrome.storage.local`.
        *   Sending messages to `background.js` to initiate actions like starting/stopping the site blocker or notifying content scripts of updated filters.
        *   Displaying status messages and the detox summary.

*   **`src/background.js` (Service Worker)**:
    *   Manages the site blocking timer:
        *   Receives `blockTwitter` message from `popup.js` and sets `blockUntil` in storage.
        *   Periodically checks if `blockUntil` time has passed to automatically unblock.
        *   Listens for `unlockTwitter` message to clear the timer.
        *   Injects blocking content into Twitter/X tabs when the timer is active.
    *   Acts as a message broker:
        *   Relays `updateKeywords`, `updateBlockedUsers`, and `updateContentFilters` messages from the popup to active `content.js` instances.

*   **`src/content.js`**:
    *   Injected into all Twitter/X pages.
    *   **Core filtering logic:**
        *   Loads blocked keywords, users, and content filter preferences from `chrome.storage.local` or via messages from `background.js`.
        *   Uses a `MutationObserver` to detect new tweets added to the DOM dynamically.
        *   For each tweet, checks against all active filters (keywords, users, images, videos).
        *   If a tweet matches a filter, applies the `.detox-hidden-tweet` CSS class to hide it.
    *   **Statistics:** Increments counters in `detoxStats` for each type of filtered content and saves them to `chrome.storage.local`.
    *   **Site Blocking Display:**
        *   Listens for `twitterTimerBlockStatus` messages from `background.js`.
        *   If site is blocked, it prevents scrolling (`document.body.style.overflow = 'hidden'`).
        *   If unblocked, it re-enables scrolling (`document.body.style.overflow = 'auto'`). (Note: The primary block page injection is handled by `background.js` injecting a script).
    *   Responds to `getDetoxStats` and `resetDetoxStats` messages from `popup.js`.

*   **`src/content.css`**:
    *   Contains CSS rules, primarily for the `.detox-hidden-tweet` class, to style how filtered tweets are displayed (e.g., faded out, bordered).

*   **Data Storage (`chrome.storage.local`)**:
    *   `blockUntil`: Timestamp for site blocker.
    *   `blockedKeywords`: Array of strings.
    *   `blockedUsernames`: Array of strings.
    *   `contentFilters`: Object `{ hideImages: boolean, hideVideos: boolean }`.
    *   `detoxStats`: Object `{ keywords: number, users: number, images: number, videos: number }`.

*   **Communication (Chrome Messaging API)**:
    *   `chrome.runtime.sendMessage`: Used by `popup.js` to communicate with `background.js`.
    *   `chrome.tabs.sendMessage`: Used by `background.js` to communicate with `content.js` on specific tabs, and by `popup.js` to communicate with `content.js` on the active tab (for stats).
    *   `chrome.runtime.onMessage.addListener`: Used in `background.js` and `content.js` to receive messages.

## 6. Development Guide

(Refer to the "Development" and "Building CSS" sections in `README.md`.)

### Debugging Tips
*   **Popup:** Right-click the extension icon, select "Inspect popup".
*   **Background Script (Service Worker):** Go to `chrome://extensions/`, find Twitter Detoxifier, and click the "service worker" link.
*   **Content Script:** Open Developer Tools (F12 or Ctrl+Shift+I) on a Twitter/X page. You can find `content.js` under the "Sources" tab (usually under "Content scripts"). Use `console.log` for debugging. Check the "Console" for errors.

## 7. Future Enhancements

(Refer to the "Future Updates" section in `README.md`.)

## 8. Contributing

(Refer to the "Contributing" section in `README.md`.)

## 9. License

This project is licensed under the **MIT License**.
