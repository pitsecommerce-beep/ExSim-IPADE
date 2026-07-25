"use client";

import { useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-2 w-full rounded-md px-3 py-1.5 text-left text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      Cerrar Sesión
    </button>
  );
}
