import { getDbHealth } from "@/lib/store";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "DB Test",
        description: "Database connectivity test page for Aizen.tr.",
    };
}

export default async function TestPage() {
    const health = await getDbHealth();

    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-3xl mx-auto">
                <div className="mb-10">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#06b6d4" }}>
                        Diagnostics
                    </p>
                    <h1 className="text-4xl font-black mb-3" style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}>
                        /test
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        DB durumu ve fallback (JSON) bilgisi.
                    </p>
                </div>

                <div
                    className="rounded-2xl p-6 mb-6"
                    style={{
                        background: "rgba(6,182,212,0.05)",
                        border: "1px solid rgba(6,182,212,0.2)",
                    }}
                >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>Backend</p>
                            <p className="text-2xl font-black" style={{ fontFamily: "var(--font-orbitron)", color: health.backend === "db" ? "#22c55e" : "#f59e0b" }}>
                                {health.backend.toUpperCase()}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>Status</p>
                            <p className="text-lg font-semibold" style={{ color: health.ok ? "#cbd5e1" : "#f87171" }}>
                                {health.ok ? "OK" : "FAIL"}
                            </p>
                        </div>
                    </div>

                    {health.connection && (
                        <div className="mt-5 text-sm" style={{ color: "#94a3b8" }}>
                            <div><span style={{ color: "#64748b" }}>Host:</span> {health.connection.host || "-"}</div>
                            <div><span style={{ color: "#64748b" }}>Port:</span> {health.connection.port ?? "-"}</div>
                            <div><span style={{ color: "#64748b" }}>DB:</span> {health.connection.database || "-"}</div>
                            <div><span style={{ color: "#64748b" }}>User:</span> {health.connection.user || "-"}</div>
                        </div>
                    )}

                    {health.error && (
                        <div className="mt-5 text-sm" style={{ color: health.backend === "db" ? "#f87171" : "#f59e0b" }}>
                            {health.error}
                        </div>
                    )}
                </div>

                {health.counts && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Posts", value: health.counts.posts, color: "#9333ea" },
                            { label: "Projects", value: health.counts.projects, color: "#06b6d4" },
                            { label: "Contacts", value: health.counts.contacts, color: "#3b82f6" },
                            { label: "Users", value: health.counts.users, color: "#22c55e" },
                        ].map((item) => (
                            <div key={item.label} className="glass-card rounded-xl p-5" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                                <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#64748b" }}>{item.label}</p>
                                <p className="text-3xl font-black mt-1" style={{ fontFamily: "var(--font-orbitron)", color: item.color }}>
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

