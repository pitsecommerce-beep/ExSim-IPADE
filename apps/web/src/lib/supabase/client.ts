import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@exsim/schema";

export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createBrowserClient<Database>(url, key);
}
