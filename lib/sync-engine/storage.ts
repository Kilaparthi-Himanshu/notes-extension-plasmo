import type { NoteType } from '../../types/noteTypes';

export const writeFullNote = async (note: NoteType) => {
    const result = await chrome.storage.local.get("notes");
    const notes: NoteType[] = result.notes || [];

    const index = notes.findIndex((n: any) => n.id === note.id);

     if (index !== -1) {
        notes[index] = note;
    } else {
        notes.push(note);
    }

     await chrome.storage.local.set({ notes });
}

export const persistLocal = () => {

}