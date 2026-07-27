"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

type AuthTab = "login" | "signup" | "participant";

export function LoginForm() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AuthTab) || "login";
  const [tab, setTab] = useState<AuthTab>(initialTab);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — IPADE branding */}
      <div className="hidden flex-col justify-between bg-ipade-primary p-12 text-white lg:flex lg:w-[480px]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={IPADE_LOGO}
              alt="IPADE"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="font-display text-xl font-bold">ExSim</span>
          </div>
        </div>
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight">
            Simulador de Negocios Competitivo
          </h2>
          <div className="mt-4 h-1 w-16 rounded bg-ipade-gold" />
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Plataforma de simulación empresarial diseñada para la formación
            ejecutiva. Toma decisiones estratégicas en un entorno competitivo
            y mide tu desempeño en tiempo real.
          </p>
        </div>
        <p className="text-xs text-white/40">IPADE Business School</p>
      </div>

      {/* Right panel — Auth forms */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ipade-bg px-4 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <img src={IPADE_LOGO} alt="IPADE" width={48} height={48} className="h-12 w-12 object-contain" />
          <h1 className="font-display text-2xl font-bold text-ipade-primary">ExSim</h1>
          <p className="text-xs text-ipade-text-muted">IPADE Business School</p>
        </div>

        <div className="w-full max-w-md">
          {/* Tab selector */}
          <div className="mb-6 flex rounded-lg border border-ipade-border bg-ipade-surface p-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-ipade-primary text-white shadow-sm"
                  : "text-ipade-text-secondary hover:text-ipade-text"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-ipade-primary text-white shadow-sm"
                  : "text-ipade-text-secondary hover:text-ipade-text"
              }`}
            >
              Crear Cuenta
            </button>
            <button
              onClick={() => setTab("participant")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "participant"
                  ? "bg-ipade-primary text-white shadow-sm"
                  : "text-ipade-text-secondary hover:text-ipade-text"
              }`}
            >
              Participante
            </button>
          </div>

          <div className="rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm">
            {tab === "login" && <LoginTab onSwitchTab={setTab} />}
            {tab === "signup" && <SignupTab onSwitchTab={setTab} />}
            {tab === "participant" && <ParticipantTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginTab({ onSwitchTab }: { onSwitchTab: (t: AuthTab) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabaseRef = useRef<ReturnType<typeof createSupabaseClient> | null>(null);

  function getSupabase() {
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
    return supabaseRef.current;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await getSupabase().auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-ipade-text">Bienvenido</h2>
      <p className="mb-6 text-sm text-ipade-text-muted">Ingresa como profesor o administrador.</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-ipade-text">
            Correo electrónico
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-ipade-text">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="Tu contraseña"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ipade-text-muted">
        ¿No tienes cuenta?{" "}
        <button onClick={() => onSwitchTab("signup")} className="font-medium text-ipade-primary hover:underline">
          Crear cuenta
        </button>
      </p>
    </>
  );
}

function SignupTab({ onSwitchTab }: { onSwitchTab: (t: AuthTab) => void }) {
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
    if (!supabaseRef.current) supabaseRef.current = createSupabaseClient();
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
      options: { data: { full_name: fullName, role: "professor" } },
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
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ipade-text">Revisa tu correo</h2>
        <p className="mt-2 text-sm text-ipade-text-secondary">
          Enviamos un enlace de confirmación a <strong>{email}</strong>.
        </p>
        <button
          onClick={() => onSwitchTab("login")}
          className="mt-6 text-sm font-medium text-ipade-primary hover:underline"
        >
          Ir a Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-ipade-text">Crear Cuenta</h2>
      <p className="mb-6 text-sm text-ipade-text-muted">Registro para profesores y administradores.</p>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label htmlFor="signup-name" className="mb-1 block text-sm font-medium text-ipade-text">Nombre completo</label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-ipade-text">Correo electrónico</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="tu@correo.com"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-ipade-text">Contraseña</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <label htmlFor="signup-confirm" className="mb-1 block text-sm font-medium text-ipade-text">Confirmar contraseña</label>
          <input
            id="signup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="Repite tu contraseña"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-ipade-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-ipade-text-muted">
        ¿Ya tienes cuenta?{" "}
        <button onClick={() => onSwitchTab("login")} className="font-medium text-ipade-primary hover:underline">
          Iniciar Sesión
        </button>
      </p>
    </>
  );
}

function ParticipantTab() {
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

  if (otpSent) {
    return (
      <>
        <h2 className="mb-1 text-lg font-semibold text-ipade-text">Código de Verificación</h2>
        <p className="mb-6 text-sm text-ipade-text-muted">
          Ingresa el código de 6 dígitos enviado a <strong className="text-ipade-text">{email}</strong>.
        </p>
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div>
            <label htmlFor="otp-code" className="mb-1 block text-sm font-medium text-ipade-text">Código</label>
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
    );
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-ipade-text">Acceso Participante</h2>
      <p className="mb-6 text-sm text-ipade-text-muted">
        Ingresa con el correo registrado por tu profesor. Te enviaremos un código de acceso.
      </p>
      <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
        <div>
          <label htmlFor="participant-email" className="mb-1 block text-sm font-medium text-ipade-text">
            Correo electrónico
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
          {loading ? "Enviando..." : "Enviar Código"}
        </button>
      </form>
    </>
  );
}
