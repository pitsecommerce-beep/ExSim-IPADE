"use client";

import { useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const IPADE_LOGO_WHITE = "https://www.ipade.mx/wp-content/uploads/2022/11/logo-ipade-color-white.svg?w=347";
const IPADE_LOGO_COLOR = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export default function PendientePage() {
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleLogout() {
    await getSupabase().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handleRetry() {
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-col justify-between bg-ipade-primary p-12 text-white lg:flex lg:w-[480px] animate-slide-in">
        <div>
          <img
            src={IPADE_LOGO_WHITE}
            alt="IPADE Business School"
            width={347}
            height={80}
            className="w-full max-w-[320px] object-contain"
          />
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Registro Pendiente
          </h2>
          <div className="mt-4 h-1 w-16 rounded bg-ipade-gold" />
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Tu solicitud de registro ha sido recibida y esta en proceso
            de revision por un administrador.
          </p>
        </div>
        <p className="text-xs text-white/40">IPADE Business School</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-ipade-bg px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <img src={IPADE_LOGO_COLOR} alt="IPADE" width={72} height={72} className="h-[72px] w-[72px] object-contain" />
          <h1 className="font-display text-2xl font-bold text-ipade-primary">ExSim</h1>
          <p className="text-xs text-ipade-text-muted">IPADE Business School</p>
        </div>

        <div className="w-full max-w-md">
          <div className="animate-fade-in rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-ipade-text">
              Cuenta Pendiente de Aprobacion
            </h2>
            <p className="mt-3 text-sm text-ipade-text-muted leading-relaxed">
              Tu registro como profesor ha sido recibido exitosamente.
              Un administrador debe aprobar tu cuenta antes de que puedas
              acceder al sistema.
            </p>
            <p className="mt-4 text-sm text-ipade-text-muted">
              Recibiras acceso una vez que tu cuenta sea autorizada.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={handleRetry}
                className="w-full rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover"
              >
                Verificar estado
              </button>
              <button
                onClick={handleLogout}
                className="w-full rounded-md border border-ipade-border px-4 py-2.5 text-sm font-medium text-ipade-text transition-colors hover:bg-ipade-bg"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
