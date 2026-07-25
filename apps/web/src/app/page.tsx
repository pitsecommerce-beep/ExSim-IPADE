import Link from "next/link";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ipade-bg px-4">
      <div className="flex flex-col items-center gap-6">
        <img
          src={IPADE_LOGO}
          alt="IPADE Business School"
          width={80}
          height={80}
          className="h-20 w-20 object-contain"
        />
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold tracking-tight text-ipade-primary">
            ExSim
          </h1>
          <p className="mt-1 text-lg text-ipade-text-secondary">
            Simulador de Negocios Competitivo
          </p>
          <div className="mx-auto mt-2 h-0.5 w-16 bg-ipade-gold" />
          <p className="mt-2 text-sm text-ipade-text-muted">
            IPADE Business School
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-md bg-ipade-accent px-8 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/signup"
          className="rounded-md border border-ipade-primary px-8 py-3 text-center text-sm font-medium text-ipade-primary transition-colors hover:bg-ipade-primary hover:text-white"
        >
          Crear Cuenta
        </Link>
      </div>
    </div>
  );
}
