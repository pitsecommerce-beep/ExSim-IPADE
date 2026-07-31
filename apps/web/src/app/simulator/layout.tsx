export default function SimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ipade-bg">
      <header className="border-b border-ipade-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-ipade-text">ExSim — Simulador Comercial</h1>
            <p className="text-xs text-ipade-text-muted">IPADE Business School</p>
          </div>
          <a href="/simulator" className="text-sm text-ipade-accent hover:underline">
            Mis mundos
          </a>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-6">
        {children}
      </main>
    </div>
  );
}
