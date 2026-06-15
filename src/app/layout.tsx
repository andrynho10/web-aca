import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Fuentes cargadas con next/font para evitar CLS y alojar en self-hosted automáticamente
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadatos globales de la app; Next.js los inyecta en el <head> de todas las páginas
export const metadata: Metadata = {
  title: "Inspecciones Gruas Horquilla Tulsa",
  description: "Panel Dashboard de inspecciones de gruas horquilla Tulsa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
