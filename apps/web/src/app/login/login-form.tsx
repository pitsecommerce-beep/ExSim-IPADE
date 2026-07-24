"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-ipade-bg">
      <div className="w-full max-w-sm rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-ipade-primary">ExSim IPADE</h1>
          <p className="mt-1 text-sm text-ipade-text-secondary">
            Inicia sesion para continuar
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-ipade-text">
              Correo electronico
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
              Contrasena
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
              placeholder="Tu contrasena"
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
            {loading ? "Ingresando..." : "Iniciar Sesion"}
          </button>
        </form>
      </div>
    </div>
  );
}
