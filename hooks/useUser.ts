import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type UserDetailsType = {
    created_at: string;
    email: string;
    subscription_status: string;
    user_id: string;
}

async function fetchUserDetails() {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !sessionData.session) {
        return { session: null, userDetails: null };
    }

    const session = sessionData.session;

    const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq("user_id", session.user.id)
        .maybeSingle<UserDetailsType>();

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
