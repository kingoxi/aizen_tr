"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleSecretAdminAccess = () => {
        router.push("/admin");
    };

    return (
        <nav
            style={{
                borderBottom: "1px solid rgba(147, 51, 234, 0.2)",
                backdropFilter: "blur(20px)",
                position: "fixed",
                top: 0,
                width: "100%",
                zIndex: 100,
            }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo (With Secret Admin Access) */}
                    <div

                        className="flex items-center gap-2 group cursor-pointer select-none"
                    >
                        <a href="/">
                            <div
                                onAuxClick={handleSecretAdminAccess}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                style={{
                                    background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                                    boxShadow: "0 0 15px rgba(124, 58, 237, 0.4)",
                                }}
                            >
                                A
                            </div>
                        </a>
                        <span
                            className="font-bold text-xl"
                            style={{
                                fontFamily: "var(--font-orbitron)",
                                background: "linear-gradient(135deg, #9333ea, #3b82f6, #06b6d4)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            <a href="/">Aizen.tr</a>
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                    style={{
                                        color: isActive ? "#a78bfa" : "#94a3b8",
                                        background: isActive ? "rgba(124, 58, 237, 0.15)" : "transparent",
                                        border: isActive ? "1px solid rgba(124, 58, 237, 0.3)" : "1px solid transparent",
                                    }}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg"
                        style={{ color: "#94a3b8", border: "1px solid rgba(147, 51, 234, 0.3)" }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden py-3 border-t" style={{ borderColor: "rgba(147, 51, 234, 0.2)" }}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-3 text-sm font-medium"
                                style={{ color: pathname === link.href ? "#a78bfa" : "#94a3b8" }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
}
