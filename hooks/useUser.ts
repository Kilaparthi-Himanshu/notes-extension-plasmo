import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

async function fetchUserDetails() {
    console.log("[React Query] fetching user details...");

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        return { session: null, userDetails: null };
    }

    const session = sessionData.session;

    const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq("user_id", session.user.id)
        .maybeSingle();

    if (userError) {
        throw userError;
    }

    return { session, userDetails };
}

export function useUser() {
    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUserDetails,
    });
}
