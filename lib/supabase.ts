import { createClient } from "@supabase/supabase-js";
 
import { Storage } from "@plasmohq/storage";
 
// Create a Plasmo storage instance
const plasmoStorage = new Storage({ area: "local" });

// Wrap it to match Supabase expected interface
const supabaseStorage = {
    getItem: async (key: string) => {
        const value = await plasmoStorage.getItem<string>(key);
        return value ?? null; // make sure it's string | null
    },
    setItem: async (key: string, value: string) => {
        await plasmoStorage.setItem(key, value);
    },
    removeItem: async (key: string) => {
        await plasmoStorage.removeItem(key);
    }
}

export const supabase = createClient(
  process.env.PLASMO_PUBLIC_SUPABASE_URL!,
  process.env.PLASMO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: supabaseStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);