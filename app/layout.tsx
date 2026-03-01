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

import { getServerSettings } from "@/lib/serverApi";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getServerSettings();

  const defaultTitle = settings?.metaTitle || "Aizen — Digital Architect Portfolio";
  const defaultDescription = settings?.metaDescription || "Hamza Nuriddinov's personal portfolio and blog. Showcasing software projects, FRC robotics achievements, and deep dives into modern web development.";
  const defaultKeywords = settings?.metaKeywords ? settings.metaKeywords.split(",").map(k => k.trim()) : [
    "Hamza Nuriddinov", "Software Developer", "Robotics", "FRC 6038", "ITOBOT", "Next.js", "Portfolio", "Aizen.tr"
  ];

  return {
    title: {
      template: "%s | aizen.tr",
      default: defaultTitle,
    },
    description: defaultDescription,
    keywords: defaultKeywords,
    authors: [{ name: "Hamza Nuriddinov" }],
    icons: {
      icon: [
        { url: "/favicon/favicon.ico" },
        { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      ],
      apple: [
        { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
    },
    manifest: "/favicon/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "https://aizen.tr",
      siteName: "Aizen.tr",
      title: defaultTitle,
      description: defaultDescription,
    },
  };
}

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

        {/* Cloudflare Web Analytics */}
        <script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "d7ea5cb5fbc94b3e859ef4581b9a1ff8"}'></script>
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}
