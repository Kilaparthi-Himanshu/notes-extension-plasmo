import type { NoteType } from '~types/noteTypes';
import { supabase } from '../supabase';

export const fetchRemote = async (noteId: string) => {
    const { data, error } = await supabase
        .from('notes')
        .select("note, version")
        .eq("id", noteId)
        .single()

    if (error) {
        console.error("Supabase error:", error);
    }

    return data;
}

export async function updateDB(
    title: string,
    noteId: string,
    note: NoteType,
    baseVersion: number
) {
    const { data, error } = await supabase
        .from("notes")
        .update({
            title,
            note,
            version: baseVersion + 1,
            updatedAt: new Date().toISOString()
        })
        .eq("id", noteId)
        .eq("version", baseVersion)
        .select("version")
        .single()

    if (error) return { success: false }

    return { success: true, version: data.version }
}

export async function insertDB(
    title: string,
    noteId: string,
    note: NoteType,
    baseVersion: number
) {
    const { data, error } = await supabase
        .from("notes")
        .insert({
            id: noteId,
            title,
            note,
            version: baseVersion + 1,
            updatedAt: new Date().toISOString()
        })
        .select("version")
        .single()

    if (error) return { success: false };

    return { success: true, version: data.version };
}
