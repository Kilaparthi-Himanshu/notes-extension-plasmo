import { createRoot } from "react-dom/client";
import React from "react";
import InjectReact, { getStyle } from "~components/inject-component";
import * as style from "~components/styles.module.css";
import { getDropdownStyle } from "~components/DropdownItems/ThemeToggle";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "~lib/queryClient";
import { getLimitInfo } from "~lib/getLimitInfo";
import { supabase } from "~lib/supabase";
import { fetchUserDetails } from "~hooks/useUser";

const rootsMap = new Map();

const loadActiveNotes = async () => {
    try {
        const result = await chrome.storage.local.get("notes");
        const notes = result.notes || [];

        const activeNotes = notes.filter(note => note.active);

        // fetch userDetails and compute limitInfo
        const { userDetails } = await fetchUserDetails();
        const limitInfo = await getLimitInfo(userDetails);

        activeNotes.forEach(note => {
            injectComponent({
                note: note,
                fromContextMenu: false,
                fromActiveNotes: true,
                limitInfo
            });
        })
    } catch (error) {
        console.error("Error loading active notes:", error);
    }
};

loadActiveNotes();

let lastRightClickPos = { x: 0, y: 0 };

// Track right-click position
document.addEventListener('contextmenu', (e) => {
    lastRightClickPos = {
        x: e.clientX,
        y: e.clientY + window.scrollY  // Add scroll offset
    };
});

// Listen for the inject message
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === "INJECT_COMPONENT") {
        injectComponent({
            position: lastRightClickPos,  // Use saved position
            fromContextMenu: message.fromContextMenu ? true : false,
            limitInfo: message.limitInfo
        });
    }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === "LOAD_NOTE") {
        const noteId = request.note.id;
        const notes = document.querySelectorAll('plasmo-csui');
        let noteExists = false;

        notes.forEach(note => {
            const element = note.shadowRoot?.querySelector('#react-injected-component');
            if (element.getAttribute("data-id") === noteId) {
                noteExists = true;
            }
        });

        if (noteExists && request.doubleClick) {
            closeNote(noteId);
        } else if (noteExists) {
            alert("Note already exists");
            return;
        } else {
            injectComponent({
                note: request.note,
                fromContextMenu: false,
                limitInfo: request.limitInfo,
            });
        }
    }
});

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === "UPDATE_NOTE_POSITION") {
        const noteElement = document.getElementById(message.noteId);
        if (noteElement) {
            const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
            if (component) {
                // Remove element after animation
                closeNote(message.noteId);
                setTimeout(() => {
                    injectComponent({
                        note: message.note,
                        fromContextMenu: false,
                        limitInfo: message.limitInfo,
                    });
                }, 300); // Match this with animation duration
            }
        }
    }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === "REMOVE_NOTE") {
        closeNote(request.noteId);
    }
});

let addedNotesIds = [];

export function removeNoteIdFromAddedNotesIds(noteId) {
    for(let i = 0; i < addedNotesIds.length; i++) {
        if(addedNotesIds[i] === noteId) {
            addedNotesIds.splice(i, 1);
            break;
        }
    }
}

export function closeNote(noteId) {
    const noteElement = document.getElementById(noteId);
    console.log("FUNCION CALLED AHHH");
    if (noteElement) {
        // Add fade-out animation
        const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
        const root = rootsMap.get(noteId);
        if (component) {
            component.classList.add(style.fadeOut);
            // Remove element after animation
            removeNoteIdFromAddedNotesIds(parseInt(noteId.split('-')[1]));
            setTimeout(() => {
                if (root) {
                    root.unmount();
                    rootsMap.delete(noteId);
                }
                noteElement.remove();
            }, 300); // Match this with animation duration
        }
    }
}

const getNextId = async () => {
    const result = await chrome.storage.local.get("notes");
    const notes = result.notes || [];

    // Extract existing IDs
    const existingIds = notes.map(note => parseInt(note.id.split('-')[1]));

    // Find the next available ID
    let nextId = 0;
    while (existingIds.includes(nextId) || addedNotesIds.includes(nextId)) {
        nextId++;
    }

    addedNotesIds.push(nextId);

    return `note-${nextId}`; // Return the new ID in the same format
};

const injectComponent = async (data) => {
    const noteId = data.note ? data.note.id : await getNextId();  // Generate unique ID

    const position = data.fromContextMenu && lastRightClickPos
        ? lastRightClickPos
        : {
            x: undefined,
            y: undefined
        };

    const container = document.createElement("plasmo-csui");
    container.id = noteId;  // Assign ID to container
    document.body.appendChild(container);

    const shadowRoot = container.attachShadow({ mode: "open" });

    const style = getStyle();
    shadowRoot.appendChild(style);

    const dropdownStyle = getDropdownStyle();
    shadowRoot.appendChild(dropdownStyle);

    const rootContainer = document.createElement("div");
    shadowRoot.appendChild(rootContainer);

    const root = createRoot(rootContainer);
    rootsMap.set(noteId, root);
    root.render(
        <QueryClientProvider client={queryClient}>
            <InjectReact 
                noteId={noteId}
                rightClickPos={position}
                initialNote={data.note}
                limitInfo={data.limitInfo}
            />
        </QueryClientProvider>
    ); // Pass ID to component
};
