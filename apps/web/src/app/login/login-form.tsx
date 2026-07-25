"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ipade-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img
            src={IPADE_LOGO}
            alt="IPADE Business School"
            width={56}
            height={56}
            className="h-14 w-14 object-contain"
          />
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-ipade-primary">ExSim</h1>
            <p className="text-xs text-ipade-text-muted">IPADE Business School</p>
          </div>
        </div>

        <div className="rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm">
          <h2 className="mb-6 text-center text-lg font-semibold text-ipade-text">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ipade-text">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ipade-text">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="Tu contraseña"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ipade-text-secondary">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="font-medium text-ipade-primary hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
