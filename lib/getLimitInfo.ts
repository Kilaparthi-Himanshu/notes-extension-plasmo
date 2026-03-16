import type { UserDetailsType } from '../hooks/useUser';
import type { NoteType } from '../types/noteTypes';
import { FREE_MAX_SYNCED_NOTES_COUNT } from './constants';

export async function getLimitInfo(userDetails?: UserDetailsType, notes: NoteType[] = []) {
    const isPro = userDetails?.subscription_status === "pro";

    const totalSyncedNotesCount = notes.reduce(
        (count, n) => count + (n.sync ? 1 : 0),
        0
    );

    const freeEditableSyncedNotesCount = notes.reduce(
        (count, n) => count + (n.sync && n.createdPlan !== "pro" ? 1 : 0),
        0
    );

    const maxReached = 
        !isPro && freeEditableSyncedNotesCount >= FREE_MAX_SYNCED_NOTES_COUNT;

    return {
        maxReached,
        freeEditableSyncedNotesCount,
        totalSyncedNotesCount,
        maxCount: FREE_MAX_SYNCED_NOTES_COUNT,
    };
}
