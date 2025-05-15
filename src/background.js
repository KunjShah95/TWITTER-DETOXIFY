// Timer-based site blocking
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'blockTwitter') {
        const now = Date.now();
        const blockUntilTime = now + message.minutes * 60 * 1000;
        chrome.storage.local.set({ blockUntil: blockUntilTime }, () => {
            console.log(`Twitter blocking until ${new Date(blockUntilTime)}`);
            blockTwitterTabs(true, blockUntilTime);
            sendTimerStatusToContentScripts(true);
        });
    }
    // Listen for keyword updates from popup
    if (message.action === 'updateKeywords') {
        // Keywords are already saved in storage by popup.js
        // Notify content scripts to re-filter
        notifyContentScriptsKeywordsUpdated(message.keywords);
    }
    // Listen for blocked user updates from popup
    if (message.action === 'updateBlockedUsers') {
        // Usernames are already saved in storage by popup.js
        // Notify content scripts to re-filter
        notifyContentScriptsBlockedUsersUpdated(message.blockedUsernames);
    }
    // Listen for content filter updates from popup
    if (message.action === 'updateContentFilters') {
        notifyContentScriptsContentFiltersUpdated(message.contentFilters);
    }
    // Listen for unlock message
    if (message.action === 'unlockTwitter') {
        chrome.storage.local.remove('blockUntil', () => {
            console.log('Twitter block timer cleared.');
            blockTwitterTabs(false); // This will now see no blockUntil and tell content scripts to unblock
            // Optionally, explicitly tell content scripts site is unblocked
            sendTimerStatusToContentScripts(false);
        });
    }
});

function sendTimerStatusToContentScripts(isBlocked) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        if (chrome.runtime.lastError) {
            console.warn("Error querying tabs in sendTimerStatusToContentScripts:", chrome.runtime.lastError.message);
            return;
        }



        if (tabs && tabs.length > 0) {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: 'twitterTimerBlockStatus', isBlocked }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn(`Failed to send timer status to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                        }
                    });
                }
            });
        }
    });
}

function notifyContentScriptsKeywordsUpdated(keywords) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        if (chrome.runtime.lastError) {
            console.warn("Error querying tabs in notifyContentScriptsKeywordsUpdated:", chrome.runtime.lastError.message);
            return;
        }
        if (tabs && tabs.length > 0) {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateKeywords', keywords }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn(`Failed to send keyword update to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                        }
                    });
                }
            });
        }
    });
}

function notifyContentScriptsBlockedUsersUpdated(blockedUsernames) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        if (chrome.runtime.lastError) {
            console.warn("Error querying tabs in notifyContentScriptsBlockedUsersUpdated:", chrome.runtime.lastError.message);
            return;
        }
        if (tabs && tabs.length > 0) {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateBlockedUsers', blockedUsernames }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn(`Failed to send blocked users update to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                        }
                    });
                }
            });
        }
    });
}

function notifyContentScriptsContentFiltersUpdated(contentFilters) {
    chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
        if (chrome.runtime.lastError) {
            console.warn("Error querying tabs in notifyContentScriptsContentFiltersUpdated:", chrome.runtime.lastError.message);
            return;
        }
        if (tabs && tabs.length > 0) {
            tabs.forEach(tab => {
                if (tab.id) {
                    chrome.tabs.sendMessage(tab.id, { action: 'updateContentFilters', contentFilters }, () => {
                        if (chrome.runtime.lastError) {
                            console.warn(`Failed to send content filters update to tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                        }
                    });
                }
            });
        }
    });
}

// Function to apply blocking to current and future Twitter tabs
function blockTwitterTabs(isStartingBlock, blockUntilTime) {
    chrome.storage.local.get(['blockUntil'], (result) => {
        if (chrome.runtime.lastError) {
            console.warn("Error getting blockUntil in blockTwitterTabs:", chrome.runtime.lastError.message);
            return;
        }
        const currentBlockUntil = isStartingBlock ? blockUntilTime : result.blockUntil;

        if (!currentBlockUntil || Date.now() > currentBlockUntil) {
            if (!isStartingBlock) {
                // Means timer expired naturally, tell content scripts to unblock page scrolling
                sendTimerStatusToContentScripts(false);
            }
            chrome.storage.local.remove('blockUntil', () => {
                if (chrome.runtime.lastError) {
                    console.warn("Error removing blockUntil from storage:", chrome.runtime.lastError.message);
                }
            });
            return; // Not blocked or timer expired
        }

        // If blocking is active, find all Twitter tabs and apply redirection/blocking content
        chrome.tabs.query({ url: ["*://twitter.com/*", "*://x.com/*"] }, (tabs) => {
            if (chrome.runtime.lastError) {
                console.warn("Error querying tabs in blockTwitterTabs:", chrome.runtime.lastError.message);
                return;
            }
            if (tabs && tabs.length > 0) {
                for (const tab of tabs) {
                    if (tab.id) {
                        injectBlockContent(tab.id);
                    }
                }
            }
        });
    });
}

function injectBlockContent(tabId) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
            document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-size:2em;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:white;font-family:Poppins,sans-serif;text-align:center;padding:20px;">Twitter is Blocked! <br> Focus on your grind.</div>';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }, () => {
        if (chrome.runtime.lastError) {
            console.warn(`Failed to inject block content into tab ${tabId}: ${chrome.runtime.lastError.message}`);
        }
    });
}

// Check on tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && (tab.url.startsWith('https://twitter.com') || tab.url.startsWith('https://x.com'))) {
        blockTwitterTabs(false); // Pass false as it's not the initial call
    }
});

// Check on tab activation
chrome.tabs.onActivated.addListener(activeInfo => {
    if (activeInfo.tabId) {
        chrome.tabs.get(activeInfo.tabId, tab => {
            if (chrome.runtime.lastError) {
                return;
            }
            if (tab && tab.url && (tab.url.startsWith('https://twitter.com') || tab.url.startsWith('https://x.com'))) {
                blockTwitterTabs(false);
            }
        });
    }
});

// Periodically check if the block time has expired
setInterval(() => {
    blockTwitterTabs(false);
}, 5000); // Check every 5 seconds

console.log("Twitter Detoxifier background script loaded.");