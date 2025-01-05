import { createRoot } from "react-dom/client";
import React from "react";
import InjectReact, { getStyle } from "~components/inject-component";
import * as style from "~components/styles.module.css";
import { getDropdownStyle } from "~components/DropdownItems/PinToggle";

const loadActiveNotes = async () => {
    try {
        const result = await chrome.storage.local.get("notes");
        const notes = result.notes || [];

        const activeNotes = notes.filter(note => note.active);

        activeNotes.forEach(note => {
            injectComponent({
                note: note,
                fromContextMenu: false,
                fromActiveNotes: true
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
            fromContextMenu: message.fromContextMenu ? true : false
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
            const noteElement = document.getElementById(noteId);
            if (noteElement) {
                // Add fade-out animation
                const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
                if (component) {
                    component.classList.add(style.fadeOut);
                    // Remove element after animation
                    setTimeout(() => {
                        noteElement.remove();
                    }, 300); // Match this with animation duration
                }
            }
        } else if (noteExists) {
            alert("Note already exists");
            return;
        } else {
            injectComponent({
                note: request.note,
                fromContextMenu: false,
            });
        }
    }
});

chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
    if (request.type === "REMOVE_NOTE") {
        const noteElement = document.getElementById(request.noteId);
        if (noteElement) {
            // Add fade-out animation
            const component = noteElement.shadowRoot?.querySelector('#react-injected-component');
            if (component) {
                component.classList.add(style.fadeOut);
                // Remove element after animation
                setTimeout(() => {
                    noteElement.remove();
                }, 300); // Match this with animation duration
            }
        }
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
    root.render(
        <InjectReact 
            noteId={noteId}
            rightClickPos={position}
            note={data.note}
        />
    ); // Pass ID to component
};