"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const IPADE_LOGO_WHITE = "https://www.ipade.mx/wp-content/uploads/2022/11/logo-ipade-color-white.svg?w=347";
const IPADE_LOGO_COLOR = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export function AccesoForm() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: otpError } = await getSupabase().auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }
    setOtpSent(true);
    setLoading(false);
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: verifyError } = await getSupabase().auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.push("/team");
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
            Acceso Participante
          </h2>
          <div className="mt-4 h-1 w-16 rounded bg-ipade-gold" />
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Ingresa con tu correo institucional para acceder a la
            simulación de tu equipo. Tu profesor te asignará un
            equipo y un mundo de simulación.
          </p>
        </div>
        <p className="text-xs text-white/40">IPADE Business School</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-ipade-bg px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <img src={IPADE_LOGO_COLOR} alt="IPADE" width={72} height={72} className="h-[72px] w-[72px] object-contain" />
          <h1 className="font-display text-2xl font-bold text-ipade-primary">ExSim</h1>
          <p className="text-xs text-ipade-text-muted">Acceso Participante</p>
        </div>

        <div className="w-full max-w-md">
          <div className="animate-fade-in rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm">
            {otpSent ? (
              <>
                <h2 className="mb-1 text-lg font-semibold text-ipade-text">Codigo de Verificacion</h2>
                <p className="mb-6 text-sm text-ipade-text-muted">
                  Ingresa el codigo de 6 digitos enviado a <strong className="text-ipade-text">{email}</strong>.
                </p>
                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="otp-code" className="mb-1 block text-sm font-medium text-ipade-text">Codigo</label>
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
                      required
                      className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-center text-2xl tracking-[0.5em] text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || token.length < 6}
                    className="mt-2 rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
                  >
                    {loading ? "Verificando..." : "Verificar"}
                  </button>
                </form>
                <button
                  onClick={() => { setOtpSent(false); setToken(""); setError(null); }}
                  className="mt-4 block w-full text-center text-sm text-ipade-text-muted hover:text-ipade-text"
                >
                  Cambiar correo
                </button>
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-semibold text-ipade-text">Acceso Participante</h2>
                <p className="mb-6 text-sm text-ipade-text-muted">
                  Ingresa con tu correo IPADE. Te enviaremos un codigo de acceso.
                </p>
                <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="participant-email" className="mb-1 block text-sm font-medium text-ipade-text">
                      Correo electronico
                    </label>
                    <input
                      id="participant-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
                      placeholder="tu@correo.com"
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
                  >
                    {loading ? "Enviando..." : "Enviar Codigo"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ipade-text-muted">
            Si eres profesor o administrador,{" "}
            <a href="/login" className="font-medium text-ipade-primary hover:underline">
              inicia sesion aqui
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
}
