"use client";
import { useState } from "react";
import { submitContact } from "@/lib/api";

export default function ContactPage() {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        try {
            await submitContact({ ...form, _gotcha: "" });
            setStatus("success");
            setForm({ name: "", email: "", subject: "", message: "" });
        } catch (err: unknown) {
            setStatus("error");
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-2xl mx-auto reveal">
                {/* Header */}
                <div className="text-center mb-12">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9333ea" }}>
                        Get in Touch
                    </p>
                    <h1
                        className="text-4xl font-black mb-4"
                        style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}
                    >
                        Contact
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        Send a message. I respond to all serious inquiries.
                    </p>
                </div>

                {/* Form card */}
                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(59,130,246,0.04))",
                        border: "1px solid rgba(124,58,237,0.25)",
                    }}
                >
                    {status === "success" ? (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                                style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)" }}
                            >
                                <svg className="w-8 h-8" fill="none" stroke="#9333ea" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: "#f1f5f9" }}>Message Sent!</h3>
                            <p style={{ color: "#94a3b8" }}>Thank you. I&apos;ll get back to you soon.</p>
                            <button
                                onClick={() => setStatus("idle")}
                                className="mt-6 btn-neon px-6 py-2 rounded-lg text-sm"
                            >
                                Send Another
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Honeypot */}
                            <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

                            {status === "error" && (
                                <div
                                    className="p-4 rounded-lg text-sm"
                                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                                >
                                    {errorMsg}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Name *</label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="neon-input"
                                        placeholder="Kurosaki Ichigo"
                                        required
                                        maxLength={100}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Email *</label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="neon-input"
                                        placeholder="ichigo@soul.society"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Subject *</label>
                                <input
                                    name="subject"
                                    value={form.subject}
                                    onChange={handleChange}
                                    className="neon-input"
                                    placeholder="Project collaboration / General inquiry"
                                    required
                                    maxLength={200}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Message *</label>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    className="neon-input"
                                    rows={6}
                                    placeholder="Tell me about your project or question..."
                                    required
                                    maxLength={5000}
                                    style={{ resize: "vertical" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === "sending"}
                                className="btn-neon w-full py-3 rounded-lg text-base"
                            >
                                {status === "sending" ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : "Send Message"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
