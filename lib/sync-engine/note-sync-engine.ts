import type { NoteType } from "~types/noteTypes";
import { debounce } from "./debounce";
import { persistLocal } from "./storage";
import { supabase } from "~lib/supabase";

export class NoteSyncEngine {
    private note: NoteType;

    private canSync: boolean;
    private canEditSyncedNote: boolean;

    private clientId = crypto.randomUUID();
    private skipNextSave = false;

    private scheduleSave: () => void;

    private onExternalUpdate?: (note: NoteType) => void;

    // Realtime variables
    private unsubscribeRealtime?: () => void;

    constructor(opts: {
        note: NoteType;
        canSync: boolean;
        canEditSyncedNote: boolean;
        onExternalUpdate?: (note: NoteType) => void;
    }) {
        this.note = opts.note;
        this.canSync = opts.canSync;
        this.canEditSyncedNote = opts.canEditSyncedNote;
        // this.scheduleSync is reference to the same debounce function being called multiple times so timer in debounce is stored
        this.scheduleSave = debounce(
            () => this.saveToSupabase(),
            500
        );

        this.onExternalUpdate = opts.onExternalUpdate;
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
        this.note = note;

        console.log(note.content);

        persistLocal(this.note);

        if (!this.canSync || !this.canEditSyncedNote) return;

        if (this.skipNextSave) {
            this.skipNextSave = false;
            console.log("Skipped DB write (remote update)");
            return;
        }

        this.scheduleSave();
    }

    async saveToSupabase() {
        const { data, error } =  await supabase
            .from("notes")
            .upsert({
                id: this.note.remoteId,
                title: this.note.title,
                note: this.note, // metadata only
                updated_at: new Date().toISOString(),
                updated_by: this.clientId,
            })
            .select();

        console.log(data);

        if (error) console.log("Error: ", error);
    }

    // Realtime logic
    initRealtime() {
        if (!this.note?.remoteId) return;
        console.log("REALTIME INITIALZED");

        const channel = supabase
            .channel(`note-${this.note.remoteId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "notes",
                    filter: `id=eq.${this.note.remoteId}`
                },
                (payload: any) => {
                    const incoming = payload.new.note;

                   if (payload.new.updated_by === this.clientId) {
                        console.log("Skipping self update");
                        return;
                    }

                    console.log("REALTIME STARTED xD", this.clientId);

                    const { content, isPasswordProtected, password, ...incomingMeta } = incoming;

                    console.log("Realtime metadata update", this.note, incoming);

                    this.skipNextSave = true;

                    this.onExternalUpdate?.({
                        ...this.note,
                        ...incomingMeta,
                    });

                    this.note = incoming;

                    persistLocal(this.note);
                }
            )
            .subscribe();

        this.unsubscribeRealtime = () => {
            supabase.removeChannel(channel);
        }
    }

    destroy() {
        console.log("Unsubscribing realtime");
        this.unsubscribeRealtime?.();
    }
}
