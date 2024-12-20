import React, { useState } from 'react';
import './popup.css';

function IndexPopup () {
    const [isPremium, setIsPremium] = useState(true);
    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState([]);

    const getNotes = () => {
        chrome.runtime.sendMessage({ type: "GET_NOTES" }, (response) => {
            if (response && response.notes) {
                setNotes(response.notes);
                // Handle the received notes here
            } else {
                console.log("No notes found.");
            }
        });
    };

    // Call the function to get notes
    getNotes();

    const handleInject = async () => {
        try {
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, { 
                type: "INJECT_COMPONENT"
            });

        } catch (err) {
            console.error("Failed:", err);
        }
    };

    const handleLoadNote = async (note) => {
        try {
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, {
                type: "LOAD_NOTE",
                fromLoadNote: true,
                note: note
            });

        } catch (err) {
            console.error("Failed:", err);
        }
    }

    const handleDeleteNote = async (note) => {
        console.log(note.id);

        const result = await chrome.storage.local.get("notes");
        const notes = result.notes;

        const newNotes = notes.filter((n) => n.id != note.id);
        console.log(newNotes);

        await chrome.storage.local.set({ "notes": newNotes });
    }

    return (
        <div className="popup">
            <button 
                onClick={handleInject}
                className="add-note-button"
                style={{
                    width: '100%',
                }}
            >
                Add New Note
            </button>

            <div>
                <input 
                    type="text" 
                    placeholder="Search..."
                    className="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {notes.length > 0 ? (
            <div
                className="saved-notes-container"
            >
                {notes.filter((note) =>
                note.title.toLowerCase().includes(search.toLowerCase()) 
                || note.content.toLowerCase().includes(search.toLowerCase()))
                .reverse()
                .map((note) => (
                    <div className="saved-note">
                        <div className="saved-note-content">
                            <h2>{note.title}</h2>
                            <p>{note.content.length > 30
                                ? note.content.slice(0, 30) + '...' 
                                : note.content}
                            </p>
                        </div>

                        <div className="saved-note-buttons">
                            <button 
                                className="load-button"
                                onClick={() => handleLoadNote(note)}
                            >
                                Load
                            </button>

                            <button 
                                className="delete-button"
                                onClick={() => handleDeleteNote(note)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            ) : (
                <div className="no-notes-container">
                    <p>No Notes To Load 😞.</p>
                </div>
            )}
        </div>
    );
}

export default IndexPopup;