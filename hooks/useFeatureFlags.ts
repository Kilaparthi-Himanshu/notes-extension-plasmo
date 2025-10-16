import { useUser } from './useUser';

export function useFeatureFlags() {
    const { data } = useUser();
    const userDetails = data?.userDetails;

    return {
        isProUser: userDetails?.subscription_status === 'pro',
        canUseAdvancedEditor: userDetails?.subscription_status === 'pro',
        canHaveGlassEffect: userDetails?.subscription_status === 'pro'
    }
}
