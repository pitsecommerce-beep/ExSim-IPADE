import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-ipade-primary">
          ExSim IPADE
        </h1>
        <p className="mt-2 text-lg text-ipade-text-secondary">
          Simulador de Negocios Competitivo
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-ipade-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ipade-accent-hover"
        >
          Iniciar Sesion
        </Link>
      </div>
    </div>
  );
}
