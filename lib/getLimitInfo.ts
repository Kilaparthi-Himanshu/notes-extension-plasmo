import type { UserDetailsType } from '../hooks/useUser';
import type { NoteType } from '../types/noteTypes';
import { FREE_MAX_SYNCED_NOTES_COUNT } from './constants';

export async function getLimitInfo(userDetails?: UserDetailsType) {
    const result = await chrome.storage.local.get("notes");
    const notes: NoteType[] = result.notes || [];

    const syncedNotes = notes.filter(n => n.sync);
    const syncedCount = syncedNotes.length;

    const maxReached = 
        userDetails?.subscription_status !== "pro" &&
        syncedCount >= FREE_MAX_SYNCED_NOTES_COUNT;

    return {
        maxReached,
        syncedCount,
        maxCount: FREE_MAX_SYNCED_NOTES_COUNT
    };
}