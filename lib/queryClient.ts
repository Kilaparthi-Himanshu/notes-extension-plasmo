import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const chromeStoratePersistor = createAsyncStoragePersister({
    storage: {
        getItem: async (key) => {
            const result = await chrome.storage.local.get(key);
            return result[key] ?? null;
        },
        setItem: async (key, value) => {
            await chrome.storage.local.set({ [key]: value });
        },
        removeItem: async (key) => {
            await chrome.storage.local.remove(key);
        }
    }
});

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
            refetchOnMount: false
        }
    }
});

persistQueryClient({
    queryClient,
    persister: chromeStoratePersistor
});
