import type { NoteType } from '~types/noteTypes';
import { supabase } from '../supabase';

export const fetchRemote = async (remoteId: string) => {
    const { data, error } = await supabase
        .from('notes')
        .select("note, version")
        .eq("id", remoteId)
        .maybeSingle()

    if (error) {
        console.error("Supabase error:", error);
    }

    return data;
}

export async function updateDB(
    remoteId: string,
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
            updated_at: new Date().toISOString()
        })
        .eq("id", remoteId)
        .eq("version", baseVersion)
        .select("version")
        .single()

    if (error) return { success: false, error }

    return { success: true, version: data.version }
}

export async function insertDB(
    remoteId: string,
    title: string,
    note: NoteType,
    baseVersion: number
) {
    const { data, error } = await supabase
        .from("notes")
        .insert({
            id: remoteId,
            title,
            note,
            version: baseVersion + 1,
            updated_at: new Date().toISOString()
        })
        .select("version")
        .single()

    if (error) return { success: false, error };

    return { success: true, version: data.version };
}
