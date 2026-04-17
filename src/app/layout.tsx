import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DevLens — Understand any codebase, instantly",
  description:
    "AI-powered codebase explorer. Generate interactive dependency graphs, map architecture, and chat with any GitHub repository.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} style={{ background: "#252525" }}>
      <body style={{
        fontFamily: "'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "100vh",
        background: "#252525",
        color: "#e8e8ed",
        margin: 0,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}>
        {children}
      </body>
    </html>
  );
}
