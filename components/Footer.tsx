"use client";
import Link from "next/link";
import { FaGithub, FaInstagram, FaTelegram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
    return (
        <footer
            style={{
                background: "rgba(13, 15, 26, 0.95)",
                borderTop: "1px solid rgba(147, 51, 234, 0.2)",
            }}
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Brand */}
                    <div>
                        <h3
                            className="font-bold mb-3"
                            style={{
                                fontFamily: "var(--font-orbitron)",
                                background: "linear-gradient(135deg, #9333ea, #3b82f6)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                fontSize: "2rem",
                            }}
                        >
                            <a href="/">Aizen.tr</a>
                        </h3>
                        <p className="text-sm" style={{ color: "#64748b" }}>
                            Soul Reaper&apos;s Digital Realm — crafting code with the precision of a Shinigami&apos;s blade.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
                            Navigation
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "/about", label: "About" },
                                { href: "/blog", label: "Blog" },
                                { href: "/projects", label: "Projects" },
                                { href: "/contact", label: "Contact" },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors duration-200"
                                        style={{ color: "#64748b" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#9333ea")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Social / Admin */}
                    <div>
                        <h4 className="text-sm font-semibold mb-3" style={{ color: "#94a3b8" }}>
                            Social
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: "https://github.com/kingoxi", label: <span className="flex items-center gap-2"><FaGithub /> Github</span> },
                                { href: "https://instagram.com/kingoxii", label: <span className="flex items-center gap-2"><FaInstagram /> Instagram</span> },
                                { href: "https://t.me/kingoxii", label: <span className="flex items-center gap-2"><FaTelegram /> Telegram</span> },
                                { href: "https://linkedin.com/in/hamza-nuriddinov/", label: <span className="flex items-center gap-2"><FaLinkedin /> Linkedin</span> },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors duration-200"
                                        style={{ color: "#64748b" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#9333ea")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div
                    className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                    style={{ borderTop: "1px solid rgba(147, 51, 234, 0.1)" }}
                >
                    <p className="text-xs" style={{ color: "#475569" }}>
                        © {new Date().getFullYear()} Aizen.tr — All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
