"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ username: "", password: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [errMsg, setErrMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        try {
            await adminLogin(form.username, form.password);
            router.push("/admin/dashboard");
        } catch (err: unknown) {
            setStatus("error");
            setErrMsg(err instanceof Error ? err.message : "Login failed");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ background: "var(--color-dark-900)" }}
        >
            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }}
            />

            <div
                className="relative w-full max-w-md rounded-2xl p-8"
                style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(59,130,246,0.05))",
                    border: "1px solid rgba(124,58,237,0.3)",
                    boxShadow: "0 0 40px rgba(124,58,237,0.1)",
                }}
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div
                        className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center text-white font-black text-xl"
                        style={{
                            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
                            boxShadow: "0 0 20px rgba(124,58,237,0.4)",
                        }}
                    >
                        A
                    </div>
                    <h1
                        className="text-2xl font-bold"
                        style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}
                    >
                        Admin Panel
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        Soul Society — Restricted Access
                    </p>
                </div>

                {status === "error" && (
                    <div
                        className="mb-5 p-4 rounded-lg text-sm"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                    >
                        {errMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Username</label>
                        <input
                            type="text"
                            value={form.username}
                            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                            className="neon-input"
                            placeholder="admin"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: "#94a3b8" }}>Password</label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                            className="neon-input"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="btn-neon w-full py-3 rounded-lg mt-2"
                    >
                        {status === "loading" ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Authenticating...
                            </span>
                        ) : "Enter Soul Society"}
                    </button>
                </form>
            </div>
        </div>
    );
}
