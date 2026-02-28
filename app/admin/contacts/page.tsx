"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetContacts, type Contact } from "@/lib/api";

export default function AdminContactsPage() {
    const router = useRouter();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        adminGetContacts()
            .then(setContacts)
            .catch(() => router.push("/admin/login"))
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="text-sm mb-1 flex items-center gap-1" style={{ color: "#64748b" }}>
                        ← Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                        Contact Messages
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        {contacts.length} message{contacts.length !== 1 ? "s" : ""} received
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(59,130,246,0.05)" }} />
                        ))}
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p style={{ color: "#64748b" }}>No messages yet.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {[...contacts].reverse().map((c) => (
                            <div
                                key={c.id}
                                className="rounded-xl overflow-hidden"
                                style={{ border: "1px solid rgba(59,130,246,0.2)", background: "rgba(59,130,246,0.05)" }}
                            >
                                <button
                                    className="w-full flex items-center justify-between p-4 text-left"
                                    onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold" style={{ color: "#f1f5f9" }}>{c.name}</span>
                                            <span className="text-sm" style={{ color: "#64748b" }}>{c.email}</span>
                                        </div>
                                        <p className="text-sm truncate mt-0.5" style={{ color: "#94a3b8" }}>{c.subject}</p>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 shrink-0">
                                        <span className="text-xs" style={{ color: "#64748b" }}>
                                            {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                        <svg
                                            className="w-4 h-4 transition-transform duration-200"
                                            style={{ color: "#64748b", transform: expanded === c.id ? "rotate(180deg)" : "rotate(0)" }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {expanded === c.id && (
                                    <div
                                        className="px-4 pb-4 pt-0 border-t"
                                        style={{ borderColor: "rgba(59,130,246,0.15)" }}
                                    >
                                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                            <div>
                                                <span style={{ color: "#64748b" }}>From: </span>
                                                <span style={{ color: "#94a3b8" }}>{c.name} &lt;{c.email}&gt;</span>
                                            </div>
                                            <div>
                                                <span style={{ color: "#64748b" }}>Received: </span>
                                                <span style={{ color: "#94a3b8" }}>{new Date(c.created_at).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div
                                            className="p-4 rounded-lg text-sm whitespace-pre-wrap"
                                            style={{ background: "rgba(0,0,0,0.3)", color: "#cbd5e1", border: "1px solid rgba(59,130,246,0.1)" }}
                                        >
                                            {c.message}
                                        </div>
                                        <div className="mt-3">
                                            <a
                                                href={`mailto:${c.email}?subject=Re: ${encodeURIComponent(c.subject)}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                                                style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#60a5fa" }}
                                            >
                                                Reply by Email
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
