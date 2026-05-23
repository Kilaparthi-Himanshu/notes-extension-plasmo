import { useUser } from './useUser';

export function useFeatureFlags() {
    const { data } = useUser();
    const userDetails = data?.userDetails;
    const isProUser = userDetails?.plan === 'pro';

    return {
        isProUser,
        canUseAdvancedEditor: isProUser,
        canHaveGlassEffect: isProUser,
        canUseSync: isProUser,
        canExport: isProUser,
    }
}
