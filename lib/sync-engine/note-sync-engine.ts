import { emitConflict } from "./conflict"
import { debounce } from "./debounce"
import { fetchRemote, pushToDB } from "./transport"
import type { Listener, RemoteNote, SyncPatch } from "./types"

export class NoteSyncEngine {
    private noteId: string;
    private content: string;
    private baseVersion: number;
    private dirty: boolean;
    private syncing = false;

    private canSync: boolean;
    private canEditSyncedNote: boolean;

    private listeners = new Set<Listener>();

    constructor(opts: {
        noteId: string
        content: string
        baseVersion: number
        dirty: boolean
        canSync: boolean
        canEditSyncedNote: boolean
    }) {
        this.noteId = opts.noteId;
        this.content = opts.content;
        this.baseVersion = opts.baseVersion;
        this.dirty = opts.dirty;
        this.canSync = opts.canSync;
        this.canEditSyncedNote = opts.canEditSyncedNote;
    }

    subscribe(cb: Listener) {
        this.listeners.add(cb);

        return () => {
            this.listeners.delete(cb)
        };
    }

    private emit(patch: SyncPatch) {
        this.listeners.forEach(cb => cb(patch));
    }

    onLocalEdit(html: string) {
        this.content = html;
        this.dirty = true;
        this.emit({ content: html, dirty: true });

        if (!this.canSync) return;
        if (!this.canEditSyncedNote) return;

        debounce(() => this.trySync(), 500);
    }

    async trySync() {
        if (!this.dirty || this.syncing) return;
        if (!this.canSync || !this.canEditSyncedNote) return;

        this.syncing = true;

        const remote: RemoteNote | null = await fetchRemote(this.noteId);

        if (!remote) {
            throw new Error('Remote version not found');
        }

        // Conflict
        if (remote.version !== this.baseVersion) {
            this.syncing = false;
            emitConflict(this.noteId, {
                local: this.content,
                remote: remote.content
            });

            return;
        }

        const res = await pushToDB(
            this.noteId,
            this.content,
            this.baseVersion
        );

        if (res.success) {
            this.baseVersion = res.version,
            this.dirty = false

            this.emit({
                baseVersion: res.version,
                dirty: false
            });
        }

        this.syncing = false;
    }

    // onRemoteFetch(remote: RemoteNote) {
    //     if (!this.dirty) {
    //         this.content = remote.content;
    //         this.baseVersion = remote.version;

    //         this.emit({
    //             content: remote.content,
    //             baseVersion: remote.version,
    //             dirty: false
    //         });
    //     }
    // }
}
