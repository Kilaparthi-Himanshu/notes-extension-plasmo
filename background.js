import { supabase } from "~lib/supabase";

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

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'summarize-with-ai',
        title: 'Summarize with NoteToGo',
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId == "summarize-with-ai" && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'SUMMARIZE',
            text: info.selectionText
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

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
        console.log(chrome.storage.local.session);
        chrome.storage.local.remove("session");
        console.log("Session removed!");
    }

    if (event === "SIGNED_IN") {
        chrome.storage.local.set({ session });
        console.log("Session created!");
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "PRINT_SESSION") {
        console.log("THE SESSION IS: ", await supabase.auth.getSession());
    }
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "new_note") {
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (tab?.id) {
                chrome.tabs.sendMessage(tab.id, { type: "INJECT_COMPONENT" });
            }
        });
    }
});
