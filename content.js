import { createRoot } from "react-dom/client"
import React from "react"
import InjectReact, { getStyle } from "~components/inject-component"

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

// content.ts
let noteCounter = 0;  // Keep track of notes

const injectComponent = (data) => {
    const noteId = `note-${noteCounter++}`;  // Generate unique ID

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

    const rootContainer = document.createElement("div");
    shadowRoot.appendChild(rootContainer);

    const root = createRoot(rootContainer);
    root.render(
        <InjectReact 
            noteId={noteId} 
            rightClickPos={position}
        />
    ); // Pass ID to component
};