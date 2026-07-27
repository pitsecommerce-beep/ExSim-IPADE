import type { Metadata } from "next";
import "./globals.css";

const IPADE_LOGO = "https://www.ipade.mx/wp-content/uploads/2022/10/fav.png?w=512";

export const metadata: Metadata = {
  title: "ExSim — IPADE Business School",
  description: "Simulador de negocios ejecutivo para IPADE Business School",
  icons: {
    icon: IPADE_LOGO,
    apple: IPADE_LOGO,
  },
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
