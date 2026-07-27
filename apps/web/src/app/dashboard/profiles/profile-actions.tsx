"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase/client";

export function ProfileActions() {
  const [creating, setCreating] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  async function handleCreate() {
    setCreating(true);
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert({ name: "Nuevo Perfil", created_by: user.id })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      setCreating(false);
      return;
    }

    router.push(`/dashboard/profiles/${data.id}`);
  }

  return (
    <button
      onClick={handleCreate}
      disabled={creating}
      className="rounded-md bg-ipade-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
    >
      {creating ? "Creando..." : "Nuevo Perfil"}
    </button>
  );
}
