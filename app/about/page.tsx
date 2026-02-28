import { getSettings } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const metadata = {
    title: "About | Aizen.tr",
    description: "Learn more about Hamza, the Soul Reaper behind Aizen.tr.",
};

export const revalidate = 0;

export default async function AboutPage() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://aizen.tr'}/api/settings`, {
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    const settings = await res.json().catch(() => null);

    const content = settings?.aboutContent || "# About Me\n\nContent could not be loaded.";

    return (
        <div className="min-h-screen py-20 px-4" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-6xl mx-auto reveal">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ─── LEFT COLUMN: PROFILE CARD ─────────────────────────────────── */}
                    <div className="lg:col-span-4">
                        <div className="glass-card rounded-2xl p-6 shadow-2xl overflow-hidden border border-purple-500/30">
                            {/* Avatar */}
                            <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6 group">
                                <img
                                    src={settings?.profileImage || "/uploads/main-page/avatar.jpg"}
                                    alt={settings?.profileName || "Hamza"}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            {/* Info */}
                            <div className="text-center lg:text-left mb-6">
                                <h1 className="text-2xl font-bold mb-1" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                                    {settings?.profileName || "Hamza"}
                                </h1>
                                <p className="text-sm font-medium mb-4" style={{ color: "#a78bfa" }}>
                                    {settings?.profileTitle || "Full-stack Developer"}
                                </p>
                                <div className="flex justify-center lg:justify-start gap-4 mb-4">
                                    {settings?.githubUrl && (
                                        <a href={settings.githubUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                                        </a>
                                    )}
                                    {settings?.linkedinUrl && (
                                        <a href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                        </a>
                                    )}
                                    {settings?.instagramUrl && (
                                        <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Contact Details List */}
                            <div className="space-y-4 border-t border-purple-500/10 pt-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-purple-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Email</p>
                                        <p className="text-xs text-gray-300 truncate w-40">{settings?.profileEmail || "example@mail.com"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-blue-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Location</p>
                                        <p className="text-xs text-gray-300">{settings?.profileLocation || "Digital Realm"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/10 text-cyan-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Phone</p>
                                        <p className="text-xs text-gray-300">{settings?.phone || "+90 5XX XXX XX XX"}</p>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="/contact"
                                className="mt-8 btn-neon w-full py-3 rounded-xl text-sm justify-center inline-flex"
                            >
                                Contact Me
                            </a>
                        </div>
                    </div>

                    {/* ─── RIGHT COLUMN: CONTENT ─────────────────────────────────────── */}
                    <div className="lg:col-span-8">
                        <div
                            className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden h-full sticky top-24"
                            style={{ border: "1px solid rgba(147, 51, 234, 0.3)" }}
                        >
                            <div className="relative z-10 prose prose-invert prose-purple max-w-none">
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-orbitron)", color: "#f8fafc" }} {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-8 mb-4 border-b border-purple-500/20 pb-2" style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }} {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-6 mb-3" style={{ color: "#e2e8f0" }} {...props} />,
                                        p: ({ node, ...props }) => <p className="text-lg leading-relaxed mb-6" style={{ color: "#94a3b8" }} {...props} />,
                                        a: ({ node, ...props }) => <a className="text-purple-400 hover:text-purple-300 transition-colors underline decoration-purple-500/30" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-6 space-y-2" style={{ color: "#94a3b8" }} {...props} />,
                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 pl-4 italic my-6" style={{ borderColor: "#7c3aed", color: "#cbd5e1", background: "rgba(124, 58, 237, 0.05)", padding: "1rem" }} {...props} />,
                                    }}
                                >
                                    {content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
