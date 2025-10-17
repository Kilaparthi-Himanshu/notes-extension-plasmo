import React, { useState, useRef, useEffect } from 'react';
import './popup.css';
import { RefreshCw } from 'lucide-react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useUser } from "./hooks/useUser";

function IndexPopup () {
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
    }, []);

    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState<any>([]);
    const [resetDisabled, setResetDisabled] = useState(false);
    const searchRef = useRef<HTMLInputElement | null>(null);
    // const [userDetails, setUserDetails] = useState<any>(null);
    // const [session, setSession] = useState<Session>(null);
    const { data, isLoading } = useUser();
    const session = data?.session;
    const userDetails = data?.userDetails;

    const handleSearch = () => {
        searchRef.current?.focus();
    };

    useEffect(() => {
        document.addEventListener("keydown", handleSearch);
        return () => document.removeEventListener("keydown", handleSearch);
    }, []);

    const getNotes = () => {
        chrome.runtime.sendMessage({ type: "GET_NOTES" }, (response) => {
            if (response && response.notes) {
                setNotes(response.notes);
                // Handle the received notes here
            }
        });
    };

    // Call the function to get notes
    useEffect(() => {
        getNotes();
    }, []);

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

    const handleLoadNote = async (note, doubleClick = false) => {
        try {
            const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, {
                type: "LOAD_NOTE",
                fromLoadNote: true,
                note: note,
                doubleClick: doubleClick
            });

        } catch (err) {
            console.error("Failed:", err);
        }
    };

    const handleDeleteNote = async (note: any) => {
        let shouldDelete = true;

        shouldDelete = window.confirm('Are You Sure You Want To Delete This Note?');

        if (!shouldDelete) {
            return;
        }

        try {
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, {
                type: "REMOVE_NOTE",
                noteId: note.id
            });

        } catch (err) {
            console.error("Failed To Remove Note:", err);
        }

        const result = await chrome.storage.local.get("notes");
        const notes = result.notes;

        const newNotes = notes.filter((n) => n.id != note.id);

        await chrome.storage.local.set({ "notes": newNotes });

        getNotes();
    };

    const handleResetPos = async (note) => {
        setResetDisabled(true);
        note.position.x = 100;
        note.position.y = 100;
        note.isPinned = true;

        const result = await chrome.storage.local.get("notes");
        const notes = result.notes;

        const noteIndex = notes.findIndex(n => n.id === note.id);
        if (noteIndex !== -1) {
            notes[noteIndex] = note;
            await chrome.storage.local.set({ "notes": notes });

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_NOTE_POSITION',
                    noteId: note.id,
                    note: note,
                });
            }
        }
        setTimeout(() => {
            setResetDisabled(false);
        }, 300);
    };

    return (
        <div className="popup p-2">
            <button 
                onClick={handleInject}
                className="add-note-button w-full"
            >
                Add New Note
            </button>

            <div style={{
                color: "white"
            }}>
                {session ? (
                    <div className='flex flex-col items-center'>
                        <div>Signed in as: {session.user.email}</div>
                        <div>
                            Subscription Plan: &nbsp;
                            <span className={`capitalize ${userDetails?.subscription_status === 'pro' && 'text-yellow-400'}`}>
                                {userDetails?.subscription_status}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div>Not signed in</div>
                )}
            </div>

            <div className='w-full'>
                <input 
                    ref = {searchRef}
                    type="text" 
                    placeholder="Search..."
                    className="search-input px-2"
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
                    // || note.content.toLowerCase().includes(search.toLowerCase())
                )
                .reverse()
                .map((note, index) => (
                        <div className="saved-note"
                            style={{
                                backgroundColor: note.color
                            }}
                            onDoubleClick={() => handleLoadNote(note, true)}
                            key={note.id || index}
                        >
                            <div className="saved-note-content">
                                <h2
                                    style={{
                                        color: note.fontColor
                                    }}
                                >
                                    {note.title}
                                </h2>
                                {/* <p 
                                // style={{
                                //         color: note.theme === "light" ? "black" : "white"
                                //     }}
                                >
                                    {note.content.length > 30
                                    ? note.content.slice(0, 30) + '...' 
                                    : note.content}
                                </p> */}
                            </div>

                            <div className="saved-note-buttons">
                                <button 
                                    className="open-button"
                                    onClick={() => handleLoadNote(note)}
                                    title='Load'
                                >
                                    Open
                                </button>

                                <button 
                                    className="delete-button"
                                    onClick={() => handleDeleteNote(note)}
                                    title='Delete'
                                >
                                    Delete
                                </button>

                                <button 
                                    disabled = {resetDisabled}
                                    className="resetPos-button"
                                    onClick={() => handleResetPos(note)}
                                    title='Reset Position'
                                    style={{
                                        cursor: resetDisabled ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <RefreshCw size={18}/>
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

export default function PopupRoot () {
    return (
        <QueryClientProvider client={queryClient}>
            <IndexPopup />
        </QueryClientProvider>
    );
}
