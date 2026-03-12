import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";

export type UserDetailsType = {
    created_at: string;
    email: string;
    subscription_status: string;
    user_id: string;
}

export async function fetchUserDetails() {
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
    const queryClient = useQueryClient();

    useEffect(() => {
        const { data: listener } = supabase.auth.onAuthStateChange(() => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
        });

        return () => {
            listener.subscription.unsubscribe();
        }
    }, []);

    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUserDetails,
    });
}
