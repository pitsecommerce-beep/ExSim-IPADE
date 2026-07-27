"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
  { href: "/dashboard/profiles", label: "Perfiles", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/dashboard/courses", label: "Cursos", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
];

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
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

  const displayName = user.user_metadata?.full_name || user.email;

  return (
    <aside className="flex w-64 flex-col bg-ipade-sidebar text-white">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3">
          <img src={IPADE_LOGO} alt="IPADE" width={32} height={32} className="h-8 w-8 object-contain" />
          <div>
            <h2 className="text-sm font-bold leading-tight">ExSim</h2>
            <p className="text-[10px] uppercase tracking-wider text-white/50">IPADE Business School</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/60">{displayName}</p>
        <button
          onClick={handleLogout}
          className="mt-2 w-full rounded-md px-3 py-1.5 text-left text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
