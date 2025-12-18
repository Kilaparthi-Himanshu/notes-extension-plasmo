import type { NoteType } from '~types/noteTypes';
import { useUser } from './useUser';

export function useFeatureFlags() {
    const { data } = useUser();
    const userDetails = data?.userDetails;
    const isProUser = userDetails?.subscription_status === 'pro';

    return {
        isProUser: isProUser,
        canUseAdvancedEditor: isProUser,
        canHaveGlassEffect: isProUser,
        canUseSync: isProUser,
    }
}
