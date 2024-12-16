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