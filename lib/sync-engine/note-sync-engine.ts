import type { NoteType } from "~types/noteTypes"
import { emitConflict } from "./conflict"
import { debounce } from "./debounce"
import { fetchRemote, insertDB, updateDB } from "./transport"
import type { Listener, RemoteNote, SyncPatch } from "./types"
import { persistLocal } from "./storage"

// export class NoteSyncEngine {
//     private noteId: string;
//     private content: string;
//     private baseVersion: number;
//     private dirty: boolean;
//     private syncing = false;

//     private canSync: boolean;
//     private canEditSyncedNote: boolean;

//     private listeners = new Set<Listener>();

//     constructor(opts: {
//         noteId: string
//         content: string
//         baseVersion: number
//         dirty: boolean
//         canSync: boolean
//         canEditSyncedNote: boolean
//     }) {
//         this.noteId = opts.noteId;
//         this.content = opts.content;
//         this.baseVersion = opts.baseVersion;
//         this.dirty = opts.dirty;
//         this.canSync = opts.canSync;
//         this.canEditSyncedNote = opts.canEditSyncedNote;
//     }

//     subscribe(cb: Listener) {
//         this.listeners.add(cb);

//         return () => {
//             this.listeners.delete(cb)
//         };
//     }

//     private emit(patch: SyncPatch) {
//         this.listeners.forEach(cb => cb(patch));
//     }

//     onLocalEdit(html: string) {
//         this.content = html;
//         this.dirty = true;
//         this.emit({ content: html, dirty: true });

//         if (!this.canSync) return;
//         if (!this.canEditSyncedNote) return;

//         debounce(() => this.trySync(), 500);
//     }

//     async trySync() {
//         if (!this.dirty || this.syncing) return;
//         if (!this.canSync || !this.canEditSyncedNote) return;

//         this.syncing = true;

//         const remote: RemoteNote | null = await fetchRemote(this.noteId);

//         if (!remote) {
//             throw new Error('Remote version not found');
//         }

//         // Conflict
//         if (remote.version !== this.baseVersion) {
//             this.syncing = false;
//             emitConflict(this.noteId, {
//                 local: this.content,
//                 remote: remote.content
//             });

//             return;
//         }

//         const res = await pushToDB(
//             this.noteId,
//             this.content,
//             this.baseVersion
//         );

//         if (res.success) {
//             this.baseVersion = res.version,
//             this.dirty = false

//             this.emit({
//                 baseVersion: res.version,
//                 dirty: false
//             });
//         }

//         this.syncing = false;
//     }

//     // onRemoteFetch(remote: RemoteNote) {
//     //     if (!this.dirty) {
//     //         this.content = remote.content;
//     //         this.baseVersion = remote.version;

//     //         this.emit({
//     //             content: remote.content,
//     //             baseVersion: remote.version,
//     //             dirty: false
//     //         });
//     //     }
//     // }
// }

export class NoteSyncEngine {
    private note: NoteType;
    private syncing = false;

    private canSync: boolean;
    private canEditSyncedNote: boolean;

    private scheduleSync: (contentChanged: boolean) => void;

    constructor(opts: {
        note: NoteType;
        canSync: boolean;
        canEditSyncedNote: boolean;
    }) {
        this.note = opts.note;
        this.canSync = opts.canSync;
        this.canEditSyncedNote = opts.canEditSyncedNote;
        this.scheduleSync = debounce(
            (contentChanged: boolean) => {
                console.log("Debounce Started");
                this.sync(contentChanged);
            },
            500
        );
    }

    setCapabilities(opts: {
        canSync: boolean;
        canEditSyncedNote: boolean;
    }) {
        this.canSync = opts.canSync;
        this.canEditSyncedNote = opts.canEditSyncedNote;
    }

    firstLocalSave(note: NoteType) {
        this.note = note;
        console.log(this.note);
        persistLocal(this.note);
    }

    updateNote(note: NoteType) {
        const prev = this.note;
        const next = note;

        const contentChanged = 
            prev.content !== next.content ||
            prev.title !== next.title;

        this.note = note;
        if (contentChanged) {
            this.note.dirty = true;
        }

        persistLocal(this.note);
        console.log(this.canSync, this.canEditSyncedNote);
        if (!this.canSync || !this.canEditSyncedNote) return;

        this.scheduleSync(contentChanged);
    }

    async firstRemotePublish() {
        // First-time publish
        const res = await insertDB(
            this.note.remoteId,
            this.note.title,
            this.note,
            this.note.baseVersion // 0
        );

        if (res.success) {
            this.note.baseVersion = res.version; // likely 1
            this.note.dirty = false;
            persistLocal(this.note);
            console.log("First Time: ",this.note);
        } else {
            console.log(res.error);
        }
    }

    async sync(contentChanged: boolean) {
        if (this.syncing) return;
        this.syncing = true;

        const remote = await fetchRemote(this.note.remoteId);
        console.log("REMOTE: ", remote);

        if (!remote) {
            await this.firstRemotePublish();

            this.syncing = false;
            return;
        }

        // Only check version if content/title changed
        if (contentChanged && remote.version !== this.note.baseVersion) {
            this.syncing = false;

            emitConflict(this.note.remoteId, {
                local: this.note.content,
                remote: remote.note.content
            });

            return;
        }

        const res = await updateDB(
            this.note.remoteId,
            this.note.title,
            this.note.id,
            this.note,
            this.note.baseVersion
        );

        if (res.success) {
            if (contentChanged) {
                this.note.baseVersion = res.version;
                this.note.dirty = false;
                persistLocal(this.note);
                console.log("Non-First Time: ",this.note);
            }
        } else {
            console.log(res.error);
        }
        console.log("Sync Phase");

        this.syncing = false;
    }

    async hydrateFromRemote() {
        if (!this.sync) return;

        const remote = await fetchRemote(this.note.remoteId);
        if (!remote) return;

        // if (this.note.dirty) {
        //     if (remote.note.content !== this.note.content || remote.note.title !== this.note.title) {

        //     }
        // }

        if (remote.note.version !== this.note.baseVersion) {
            this.note = {
                ...this.note,
                ...remote.note,
                baseVersion: remote.version,
                dirty: false
            }

            persistLocal(this.note);
            console.log("Hydrated From Remote: ", this.note);
        }
    }
}
