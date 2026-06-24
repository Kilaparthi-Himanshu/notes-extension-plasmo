import React, { useState, useRef, useEffect } from 'react';
import './popup.css';
import { RefreshCw } from 'lucide-react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useUser } from "./hooks/useUser";
import type { LimitInfo, NoteType } from './types/noteTypes';
import { supabase } from '~lib/supabase';
import { deleteRemote } from '~lib/sync-engine/transport';
import { FREE_MAX_SYNCED_NOTES_COUNT } from './lib/constants';
import { VisibleLimit } from "react-visible-limit";
import { getLimitInfo } from "./lib/getLimitInfo";
import NoteToGoIcon from "./assets/icon.png";

function IndexPopup () {
    useEffect(() => {
        queryClient.invalidateQueries({ queryKey: ['user'] });
    }, []);

    const [search, setSearch] = useState("");
    const [notes, setNotes] = useState<any>([]);
    const [resetDisabled, setResetDisabled] = useState(false);
    const searchRef = useRef<HTMLInputElement | null>(null);
    const [limitInfo, setLimitInfo] = useState<LimitInfo | null>(null);
    const { data, isFetching } = useUser();
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
        const response = await chrome.storage.local.get("notes");
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
            .select("note, version, updated_at")
            .eq("user_id", session.user.id);

        if (error) {
            console.error(error);
            return null;
        }

        return data.map((row: any) => ({
            ...row.note,
            baseVersion: row.version,
            updatedAt: row.updated_at,
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
            return;
        }

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

            // synced note already exists locally means we just push it based on greatest updatedVersion as DB has latest usually unless simultaneous editing occurs (logic might change)
            if (remote.updatedAt > local.updatedAt) {
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

        setNotes(merged);
    }

    useEffect(() => {
        mergeSyncedNotes();
    }, [userDetails]);

    const syncedNotes = notes.filter((n: any) => n.sync);
    const unsyncedNotes = notes.filter((n: any) => !n.sync);

    const syncedNotesCount = syncedNotes.length;
    const unsyncedNotesCount = unsyncedNotes.length;

    useEffect(() => {
        const loadLimit = async() => {
            const info = await getLimitInfo(userDetails, notes);
            setLimitInfo(info);
        }

        loadLimit();
    }, [userDetails, notes]);

    function truncateTitle(title: string, max = 28) {
        return title.length > max
            ? title.slice(0, max) + "..."
            : title;
    }

    return (
        <div className="popup p-1 overflow-y-hidden">
            <div className='w-full h-max flex flex-col gap-2 p-2'>
                <button
                    onClick={handleInject}
                    className="w-full h-7 rounded-lg bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-semibold text-lg shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    Add New Note <img src={NoteToGoIcon} className='size-[18px]' />
                </button>

                <div className="border border-purple-400 rounded-lg text-white w-full">
                    <div className="p-1">
                        {session ? (
                            <div className="flex justify-between gap-2 items-center">
                                {/* Left Side */}
                                <div className="min-w-0 flex-1">
                                    <div
                                        className="truncate text-sm font-medium"
                                        title={session.user.email}
                                    >
                                        {session.user.email}
                                    </div>

                                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                                        <span
                                            className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                                                userDetails?.plan === "pro"
                                                    ? "bg-yellow-700 text-yellow-200"
                                                    : "bg-blue-700 text-blue-200"
                                            }`}
                                        >
                                            {userDetails?.plan === "pro"
                                                ? "⭐ Pro"
                                                : "Free"}
                                        </span>

                                        {userDetails?.plan === "free" && (
                                            <button
                                                onClick={() =>
                                                    chrome.tabs.create({
                                                        url: "https://notetogo.vercel.app/",
                                                    })
                                                }
                                                className="
                                                    text-xs
                                                    font-semibold
                                                    px-2 py-0.5
                                                    rounded-full
                                                    bg-gradient-to-r
                                                    from-orange-500
                                                    to-yellow-500
                                                    text-black
                                                    hover:opacity-90
                                                    transition-all
                                                "
                                            >
                                                ✨ Get Pro
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side */}
                                <div className="flex flex-col gap-1 shrink-0">
                                    <button
                                        onClick={() => chrome.runtime.openOptionsPage()}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-sm px-3 py-1 rounded-md transition-all"
                                    >
                                        Options
                                    </button>

                                    <button
                                        onClick={() => {
                                            chrome.tabs.create({
                                                url: chrome.runtime.getURL(
                                                    "options.html#/signin"
                                                ),
                                            });
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700 text-sm px-3 py-1 rounded-md transition-all"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between gap-2 items-center">
                                <span className="text-sm text-gray-300">
                                    Not Signed In
                                </span>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            chrome.tabs.create({
                                                url: chrome.runtime.getURL(
                                                    "options.html#/signin"
                                                ),
                                            });
                                        }}
                                        className="bg-purple-600 hover:bg-purple-700 text-sm px-3 py-1 rounded-md transition-all"
                                    >
                                        Sign In
                                    </button>

                                    <button
                                        onClick={() => chrome.runtime.openOptionsPage()}
                                        className="bg-cyan-600 hover:bg-cyan-700 text-sm px-3 py-1 rounded-md transition-all"
                                    >
                                        Options
                                    </button>
                                </div>
                            </div>
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

                    {userDetails?.plan !== "pro" 
                        ?
                            <span className='text-sm flex gap-2'>
                                <p>
                                    Editable: {limitInfo?.freeEditableSyncedNotesCount}/{FREE_MAX_SYNCED_NOTES_COUNT}
                                </p>

                                <p>
                                    Total: {syncedNotesCount}
                                </p>
                            </span>
                        :
                            <span className='text-sm flex gap-2'>
                                <p>
                                    {limitInfo?.totalSyncedNotesCount}/∞
                                </p>
                            </span>
                    }
                </div>
            </div>

            {syncedNotes.length > 0 ? (
                <VisibleLimit
                    className="saved-notes-container flex flex-column gap-[10px] pb-[10px]"
                    maxVisible={3}
                    gap={10}
                >
                    {syncedNotes.filter((note: NoteType) =>
                        note.title.toLowerCase().includes(search.toLowerCase()) 
                        // || note.content.toLowerCase().includes(search.toLowerCase())
                    )
                    .reverse()
                    .map((note: NoteType, index: any) => {
                        const textColor = getReadableTextColor(note.color);

                        return (
                            <div className="saved-note border-2 border-green-600 overflow-hidden"
                                style={{
                                    backgroundColor: note.color
                                }}
                                onDoubleClick={() => handleLoadNote(note, true)}
                                key={note.id || index}
                            >
                                <div className="saved-note-content flex-1 min-w-0">
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
                                        {truncateTitle(note.title)}
                                    </h2>
                                </div>

                                <div className="saved-note-buttons justify-center">
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
                        )})
                    }
                </VisibleLimit>
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
                <VisibleLimit
                    className="saved-notes-container flex flex-column gap-[10px] pb-[10px]"
                    maxVisible={3}
                    gap={10}
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
                                <div className="saved-note-content flex-1 min-w-0">
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
                                        {truncateTitle(note.title)}
                                    </h2>
                                </div>

                                <div className="saved-note-buttons justify-center">
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
                        )})
                    }
                </VisibleLimit>
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
