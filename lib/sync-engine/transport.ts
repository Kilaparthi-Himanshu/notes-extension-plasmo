import { supabase } from '../supabase';
import type { RemoteNote } from './types';

export const fetchRemote = async (noteId: string) => {
    const { data } = await supabase
        .from('notes')
        .select("content, version")
        .eq("id", noteId)
        .single()

    return data;
}

export async function pushToDB(
    noteId: string,
    content: string,
    baseVersion: number
) {
    const { data, error } = await supabase
        .from("notes")
        .update({
            content,
            version: baseVersion + 1
        })
        .eq("id", noteId)
        .eq("version", baseVersion)
        .select("version")
        .single()

    if (error) return { success: false }

    return { success: true, version: data.version }
}
