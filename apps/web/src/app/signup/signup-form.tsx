"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createSupabaseClient();
    }
    return supabaseRef.current;
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setSuccess(true);
    }
  }

  if (success) {
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
          </div>
          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-ipade-text">Revisa tu correo</h2>
            <p className="mt-2 text-sm text-ipade-text-secondary">
              Enviamos un enlace de confirmación a <strong>{email}</strong>. Haz clic en el enlace para activar tu cuenta.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-ipade-primary hover:underline"
            >
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
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
            Crear Cuenta
          </h2>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-ipade-text">
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="Juan Pérez"
              />
            </div>

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
                minLength={6}
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-ipade-text">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                placeholder="Repite tu contraseña"
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
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-ipade-text-secondary">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-ipade-primary hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
