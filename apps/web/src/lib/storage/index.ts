import type { StorageAdapter } from "./types";
import { memoryStorage } from "./memory";

export type { StorageAdapter, WorldData, DecisionData } from "./types";

export function getStorage(): StorageAdapter {
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasSupabase) {
    return memoryStorage;
  }

  return memoryStorage;
}
