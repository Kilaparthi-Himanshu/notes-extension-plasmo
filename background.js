chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "add-note",
        title: "Add Note Here",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "add-note" && tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
            type: "INJECT_COMPONENT",
            fromContextMenu: true
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_NOTES") {
        // Retrieve notes from storage
        chrome.storage.local.get("notes", (result) => {
            const notes = result.notes || [];
            sendResponse({ notes });
        });
        return true; // Keep the message channel open for sendResponse
    }
});