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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
