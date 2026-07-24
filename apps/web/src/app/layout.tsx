import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExSim IPADE",
  description: "Simulador de negocios competitivo para IPADE Business School",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
