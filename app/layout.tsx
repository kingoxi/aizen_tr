import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CursorTracker from "@/components/CursorTracker";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Aizen.tr",
    default: "Aizen.tr — Soul Reaper's Digital Realm",
  },
  description:
    "Personal portfolio, blog, and project showcase. Anime-themed dark-mode website with neon aesthetics.",
  keywords: ["portfolio", "blog", "projects", "anime", "developer", "aizen"],
  authors: [{ name: "Aizen" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aizen.tr",
    siteName: "Aizen.tr",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${orbitron.variable} antialiased min-h-screen flex flex-col`}
        style={{ background: "var(--color-dark-900)" }}
      >
        <CursorTracker />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
