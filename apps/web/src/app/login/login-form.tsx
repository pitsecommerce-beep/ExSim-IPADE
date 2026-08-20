"use client";

import { useRef, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { isProfessorEmail, isSuperAdminEmail } from "@/lib/auth/email-rules";

const IPADE_LOGO_WHITE = "https://www.ipade.mx/wp-content/uploads/2022/11/logo-ipade-color-white.svg?w=347";
const IPADE_LOGO_COLOR = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

type AuthTab = "login" | "signup";

export function LoginForm() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as AuthTab) || "login";
  const [tab, setTab] = useState<AuthTab>(initialTab);

  return (
    <div className="flex min-h-screen">
      {/* Left panel — IPADE branding */}
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
            Simulador de Negocios Ejecutivo
          </h2>
          <div className="mt-4 h-1 w-16 rounded bg-ipade-gold" />
          <p className="mt-6 text-sm leading-relaxed text-white/70">
            Plataforma de simulacion empresarial diseñada para la formacion
            ejecutiva. Toma decisiones estrategicas en un entorno competitivo
            y mide tu desempeño en tiempo real.
          </p>
        </div>
        <p className="text-xs text-white/40">IPADE Business School</p>
      </div>

      {/* Right panel — Auth forms */}
      <div className="flex flex-1 flex-col items-center justify-center bg-ipade-bg px-4 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center gap-2 lg:hidden">
          <img src={IPADE_LOGO_COLOR} alt="IPADE" width={72} height={72} className="h-[72px] w-[72px] object-contain" />
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
              Iniciar Sesion
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
          </div>

          <div key={tab} className="animate-fade-in rounded-lg border border-ipade-border bg-ipade-surface p-8 shadow-sm">
            {tab === "login" && <LoginTab onSwitchTab={setTab} />}
            {tab === "signup" && <SignupTab onSwitchTab={setTab} />}
          </div>

          <p className="mt-6 text-center text-xs text-ipade-text-muted">
            Si eres participante,{" "}
            <a href="/acceso" className="font-medium text-ipade-primary hover:underline">
              ingresa aqui
            </a>.
          </p>
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

    const trimmedEmail = email.trim().toLowerCase();

    if (!isProfessorEmail(trimmedEmail)) {
      setError("Solo correos @ipade.mx pueden iniciar sesion como profesor.");
      setLoading(false);
      return;
    }

    const supabase = getSupabase();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const user = data.user;
    const role = user?.user_metadata?.role as string | undefined;
    const approved = user?.user_metadata?.approved === true;

    if (isSuperAdminEmail(trimmedEmail) && role !== "admin") {
      await supabase.auth.updateUser({
        data: { role: "admin", approved: true },
      });
    }

    if (role === "professor" && !approved && !isSuperAdminEmail(trimmedEmail)) {
      router.push("/pendiente");
      router.refresh();
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-ipade-text">Bienvenido</h2>
      <p className="mb-6 text-sm text-ipade-text-muted">Ingresa como profesor o administrador con tu correo @ipade.mx.</p>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-ipade-text">
            Correo electronico
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="tu@ipade.mx"
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
          {loading ? "Ingresando..." : "Iniciar Sesion"}
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

    const trimmedEmail = email.trim().toLowerCase();

    if (!isProfessorEmail(trimmedEmail)) {
      setError("Solo correos @ipade.mx pueden registrarse como profesor.");
      setLoading(false);
      return;
    }

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

    const isSuperAdminSignup = isSuperAdminEmail(trimmedEmail);
    const role = isSuperAdminSignup ? "admin" : "professor";
    const approved = isSuperAdminSignup;

    const { data, error: authError } = await getSupabase().auth.signUp({
      email: trimmedEmail,
      password,
      options: { data: { full_name: fullName, role, approved } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (isSuperAdminSignup && data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-ipade-text">Registro Recibido</h2>
        <p className="mt-2 text-sm text-ipade-text-secondary">
          Tu solicitud de registro ha sido enviada. Un administrador debe
          aprobar tu cuenta antes de que puedas acceder al sistema.
        </p>
        <p className="mt-2 text-sm text-ipade-text-muted">
          Recibiras acceso una vez aprobada tu cuenta.
        </p>
        <button
          onClick={() => onSwitchTab("login")}
          className="mt-6 text-sm font-medium text-ipade-primary hover:underline"
        >
          Ir a Iniciar Sesion
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-1 text-lg font-semibold text-ipade-text">Crear Cuenta</h2>
      <p className="mb-6 text-sm text-ipade-text-muted">Registro para profesores. Requiere correo @ipade.mx y aprobacion de un administrador.</p>

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
            placeholder="Juan Perez"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-ipade-text">Correo electronico</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-ipade-border bg-ipade-bg px-3 py-2.5 text-sm text-ipade-text placeholder:text-ipade-text-muted focus:border-ipade-accent focus:outline-none focus:ring-1 focus:ring-ipade-accent"
            placeholder="tu@ipade.mx"
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
            placeholder="Minimo 6 caracteres"
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
          Iniciar Sesion
        </button>
      </p>
    </>
  );
}
