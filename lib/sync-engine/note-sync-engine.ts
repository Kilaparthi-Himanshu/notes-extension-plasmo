import type { NoteType } from "~types/noteTypes"
import { emitConflict } from "./conflict"
import { debounce } from "./debounce"
import { fetchRemote, insertRemote, updateMetada, updateRemote } from "./transport"
import type { Listener, RemoteNote, SyncPatch } from "./types"
import { persistLocal } from "./storage"

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
                // console.log("Debounce Started");
                this.sync(contentChanged);
            },
            500
        );
        // this.scheduleSync is reference to the same debounce function being called multiple times so timer in debounce is stored
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

        this.note = {
            ...note,
            baseVersion: this.note.baseVersion,
        };

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
        const res = await insertRemote(
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
        console.log("Remote Ver: ", remote.version);
        console.log("Base Ver: ", this.note.baseVersion);
        if (contentChanged && remote.version !== this.note.baseVersion) {
            this.syncing = false;

            emitConflict(this.note.remoteId, {
                local: this.note.content,
                remote: remote.note.content
            });

            return;
        }

        if (contentChanged) {
            const res = await updateRemote(
                this.note.remoteId,
                this.note.title,
                this.note.id,
                this.note,
                this.note.baseVersion
            );

            if (res.success) {
                this.note.baseVersion = res.version;
                console.log("SUCCESS RES: ", this.note.baseVersion);
                this.note.dirty = false;
                persistLocal(this.note);
            } else {
                console.log(res.error);
            }
        } else {
            await updateMetada(
                this.note.remoteId,
                this.note
            );
        }

        console.log("Sync Phase");

        this.syncing = false;
    }

    async hydrateFromRemote() {
        if (!this.canSync) return;

        const remote = await fetchRemote(this.note.remoteId);
        if (!remote) return;

        // If remote newer
        if (remote.note.version > this.note.baseVersion) {

            // If local has unsynced changes -> conflict
            if (this.note.dirty) {
                emitConflict(this.note.remoteId, {
                    local: this.note.content,
                    remote: remote.note.content
                });
                return;
            }

            // Otherwise safe to overwrite
            this.note = {
                ...this.note,
                ...remote.note,
                baseVersion: remote.version,
                dirty: false
            };

            persistLocal(this.note);
            console.log("Hydarated from remote: ", this.note);

            return this.note;
        }
    }
}
