import React, { useState, useRef, useEffect } from 'react';
import './popup.css';
import { RefreshCw } from 'lucide-react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useUser } from "./hooks/useUser";
import type { NoteType } from './types/noteTypes';
import { supabase } from '~lib/supabase';
import { deleteRemote } from '~lib/sync-engine/transport';
import { FREE_MAX_SYNCED_NOTES_COUNT } from './lib/constants';

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

    const getNotes = async () => {
        const response = await chrome.runtime.sendMessage({ type: "GET_NOTES" });
        console.log("UGG: ", response?.notes);
        return response?.notes ?? [];
    };

    const handleInject = async () => {
        try {
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, { 
                type: "INJECT_COMPONENT",
                limitInfo,
            });

        } catch (err) {
            console.error("Failed:", err);
        }
    };

    const handleLoadNote = async (note: NoteType, doubleClick = false) => {
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
                doubleClick: doubleClick,
                limitInfo,
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
            // remove from DB if synced
            if (note.sync && note.remoteId && navigator.onLine) {
                const response = await deleteRemote(note.remoteId);

                if (response.error) {
                    throw response.error;
                }
            }

            // remove from current tab UI
            const [tab] = await chrome.tabs.query({ 
                active: true, 
                currentWindow: true 
            });

            if (!tab.id) return;

            await chrome.tabs.sendMessage(tab.id, {
                type: "REMOVE_NOTE",
                noteId: note.id
            });

            // remove from local storage
            const result = await chrome.storage.local.get("notes");
            const notes = result.notes || [];

            const newNotes = notes.filter((n: any) => n.id !== note.id);

            await chrome.storage.local.set({ "notes": newNotes });

            await mergeSyncedNotes();
        } catch (err) {
            console.error("Failed To Remove Note:", err);
        }
    };

    const handleResetPos = async (note: NoteType) => {
        setResetDisabled(true);
        note.position.x = 100;
        note.position.y = 100;
        note.isPinned = true;

        const result = await chrome.storage.local.get("notes");
        const notes = result.notes;

        const noteIndex = notes.findIndex((n: any) => n.id === note.id);
        if (noteIndex !== -1) {
            notes[noteIndex] = note;
            await chrome.storage.local.set({ "notes": notes });

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab?.id) {
                await chrome.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_NOTE_POSITION',
                    noteId: note.id,
                    note: note,
                    limitInfo,
                });
            }
        }
        setTimeout(() => {
            setResetDisabled(false);
        }, 300);
    };

    function getReadableTextColor(bgColor: string) {
        if (!bgColor) return "#111";

        let r = 0, g = 0, b = 0;

        if (bgColor.startsWith("#")) {
            const hex = bgColor.replace("#", "");
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (bgColor.startsWith("rgb")) {
            const matches = bgColor.match(/\d+/g);
            if (matches) {
                [r, g, b] = matches.map(Number);
            }
        }

        // Perceived luminance formula
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);

        return luminance > 160 ? "#111" : "#fff";
    }

    async function fetchAllRemoteNotes() {
        const { data, error } = await supabase
            .from("notes")
            .select("note, version")
            .eq("user_id", session.user.id);

        if (error) {
            console.error(error);
            return null;
        }

        return data.map((row: any) => ({
            ...row.note,
            baseVersion: row.version
        }));
    }

    function generateLocalId(localIds: Set<string>) {
        let i = 0;
        while (localIds.has(`note-${i}`)) {
            i++;
        }
        const id = `note-${i}`;
        localIds.add(id);
        return id;
    }

    async function mergeSyncedNotes() {
        // latest session is crucial here, so we fetch directly instead of relying on react query
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        // local notes = local synced + local unsynced
        const localNotes: NoteType[] = await getNotes();

        // If user is not signed in -> only show local notes
        if (!session || !navigator.onLine) {
            setNotes(localNotes);
            console.log("NO SESSION: ", session, localNotes);
            return;
        }
        console.log("SESSION: ", session, localNotes);

        // remote notes = remote synced (might or might not exist locally)
        let remoteNotes: NoteType[] = [];

        try {
            remoteNotes = await fetchAllRemoteNotes();

            if (!remoteNotes) {
                setNotes(localNotes);
                return;
            }
        } catch (err) {
            console.warn("Remote fetch failed, using local notes only.");
            setNotes(localNotes);
            return;
        }

        // Handle remote deletions
        /// General rule of thumb is that a synced note must always exist in the DB.
        /// If a synced note exists locally but not in the DB, it probably means the note has been deleted, so we remove
        /// the note locally as well.
        const remoteIds = new Set(remoteNotes.map(n => n.remoteId));

        const filterLocal = localNotes.filter(n => {
            if (!n.sync) return true; // if it is non synced note let it pass through
            return remoteIds.has(n.remoteId); // if it is synced and exists both locally and remotely let is pass through
        });

        // Merge synced new, synced existing and local notes
        const localSynced = filterLocal.filter(n => n.sync);
        // creating a map of local synced notes for easy lookup of remote synced notes within them
        const localMap = new Map(localSynced.map(n => [n.remoteId, n]));

        // first we write all local non synced notes
        const merged = [...filterLocal.filter(n => !n.sync)];

        // set of local existing (synced + non synced) ids
        const localIds = new Set(filterLocal.map(n => n.id));

        // checking for existance of remote synced notes locally and merging accordingly
        for (const remote of remoteNotes) {
            const local = localMap.get(remote.remoteId);

            // synced note dosen't exist in local which means a clash of note-{id} might occur so we fix it
            // a synced note existing in DB but not locally means its a new synced note
            if (!local) {
                const newId = generateLocalId(localIds);

                // new note from another PC being assigned a unique note-{id}
                merged.push({
                    ...remote,
                    id: newId
                });
                continue;
            }

            // synced note already exists locally means we just push it based on greatest baseVersion (logic might change)
            if (remote.baseVersion > local.baseVersion) {
                // remote synced note newer than local synced note
                merged.push({
                    ...remote,
                    id: local.id
                });
            } else {
                // local synced note newer than remote synced note (for now)
                /// with current restrictions on offline editing of synced notes and them being editable only when user is online,
                /// this else part is expected never to be reached.
                merged.push(local);
            }
        }

        await chrome.storage.local.set({ notes: merged });
        console.log("MERGED: ", merged);

        setNotes(merged);
    }

    useEffect(() => {
        mergeSyncedNotes();
        console.log(userDetails);
    }, []);

    const syncedNotes = notes.filter((n: any) => n.sync);
    const unsyncedNotes = notes.filter((n: any) => !n.sync);

    const syncedNotesCount = syncedNotes.length;
    const unsyncedNotesCount = unsyncedNotes.length;

    const maxSyncedNotesCountReached = userDetails?.subscription_status !== "pro"
        && syncedNotesCount >= FREE_MAX_SYNCED_NOTES_COUNT;

    const limitInfo = {
        maxReached: maxSyncedNotesCountReached,
        syncedCount: syncedNotesCount,
        maxCount: FREE_MAX_SYNCED_NOTES_COUNT
    }

    // useEffect(() => {
    //     console.log(syncedNotes, unsyncedNotes);
    // }, [syncedNotes, unsyncedNotes]);

    return (
        <div className="popup p-1">
            <div className='w-full h-max flex flex-col gap-2 p-2'>
                <button 
                    onClick={handleInject}
                    className="add-note-button w-full"
                >
                    Add New Note
                </button>

                <div
                    className='border border-purple-400 rounded-lg text-white w-full'
                >
                    <div className='flex flex-col items-center py-1'>
                        {session ? (
                            <div>
                                <div>Signed in as: &nbsp;
                                    <span className='bg-green-700 px-1 rounded-md'>{session.user.email}
                                        </span>
                                    </div>
                                <div>
                                    Subscription Plan: &nbsp;
                                    <span className={`capitalize ${userDetails?.subscription_status === 'pro' ? 'text-yellow-400 bg-yellow-700 px-1 rounded-md' : userDetails?.subscription_status === 'free' ? 'text-blue-300 bg-blue-700 px-1 rounded-md' : ''}`}>
                                        {userDetails?.subscription_status}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div>Not signed in</div>
                        )}
                    </div>
                </div>

                <input 
                    ref = {searchRef}
                    type="text" 
                    placeholder="Search..."
                    className="search-input px-2"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className='w-full p-2 text-white text-xl'>
                <div className='w-full flex justify-between items-center border-b'>
                    <span className='px-2 pl-0 min-w-0 w-full flex-1 '>Synced Notes</span>

                    <span className='text-sm'>
                        {syncedNotesCount}/
                        {userDetails?.subscription_status === "pro" 
                            ? "∞"
                            : FREE_MAX_SYNCED_NOTES_COUNT
                        }
                    </span>
                </div>
            </div>

            {syncedNotes.length > 0 ? (
                <div
                    className="saved-notes-container flex flex-column gap-[10px]"
                >
                    {syncedNotes.filter((note: NoteType) =>
                        note.title.toLowerCase().includes(search.toLowerCase()) 
                        // || note.content.toLowerCase().includes(search.toLowerCase())
                    )
                    .reverse()
                    .map((note: NoteType, index: any) => {
                        const textColor = getReadableTextColor(note.color);

                        return (
                            <div className="saved-note border-2 border-green-600"
                                style={{
                                    backgroundColor: note.color
                                }}
                                onDoubleClick={() => handleLoadNote(note, true)}
                                key={note.id || index}
                            >
                                <div className="saved-note-content">
                                    <h2
                                        style={{
                                            color: textColor,
                                            fontWeight: 600,
                                            fontSize: "16px",
                                            textShadow:
                                            textColor === "#fff"
                                                ? "0 1px 2px rgba(0,0,0,0.4)"
                                                : "0 1px 1px rgba(255,255,255,0.25)"
                                        }}
                                    >
                                        {note.title}
                                    </h2>
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
                        )})}
                </div>
            ) : (
                <div className="no-notes-container">
                    <p>No Notes To Load 😞.</p>
                </div>
            )}

            <div className='w-full p-2 text-white text-xl'>
                <div className='w-full flex justify-between items-center border-b'>
                    <span className='px-2 pl-0 min-w-0 w-full flex-1 '>Local Notes</span>

                    <span className='text-sm'>
                        {unsyncedNotesCount}
                    </span>
                </div>
            </div>

            {unsyncedNotes.length > 0 ? (
                <div
                    className="saved-notes-container flex flex-column gap-[10px] mb-[10px]"
                >
                    {unsyncedNotes.filter((note: NoteType) =>
                        note.title.toLowerCase().includes(search.toLowerCase()) 
                        // || note.content.toLowerCase().includes(search.toLowerCase())
                    )
                    .reverse()
                    .map((note: NoteType, index: any) => {
                        const textColor = getReadableTextColor(note.color);

                        return (
                            <div className="saved-note border-2 border-blue-600"
                                style={{
                                    backgroundColor: note.color
                                }}
                                onDoubleClick={() => handleLoadNote(note, true)}
                                key={note.id || index}
                            >
                                <div className="saved-note-content">
                                    <h2
                                        style={{
                                            color: textColor,
                                            fontWeight: 600,
                                            fontSize: "16px",
                                            textShadow:
                                            textColor === "#fff"
                                                ? "0 1px 2px rgba(0,0,0,0.4)"
                                                : "0 1px 1px rgba(255,255,255,0.25)"
                                        }}
                                    >
                                        {note.title}
                                    </h2>
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
                        )})}
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
