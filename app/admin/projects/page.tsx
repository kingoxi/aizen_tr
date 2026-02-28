"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetProjects, adminDeleteProject, type Project } from "@/lib/api";

export default function AdminProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        adminGetProjects()
            .then(setProjects)
            .catch(() => router.push("/admin/login"))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        await adminDeleteProject(id);
        load();
    };

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/dashboard" className="text-sm mb-1 flex items-center gap-1" style={{ color: "#64748b" }}>
                            ← Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            Manage Projects
                        </h1>
                    </div>
                    <Link href="/admin/projects/new" className="btn-neon px-5 py-2.5 rounded-lg text-sm">
                        + New Project
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(6,182,212,0.05)" }} />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p style={{ color: "#64748b" }}>No projects yet. Add your first project!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between p-4 rounded-xl"
                                style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.15)" }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate" style={{ color: "#f1f5f9" }}>{p.name}</h3>
                                    <p className="text-sm" style={{ color: "#64748b" }}>
                                        /projects/{p.slug} · {new Date(p.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <Link
                                        href={`/projects/${p.slug}`}
                                        target="_blank"
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/admin/projects/${p.id}`}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)", background: "rgba(6,182,212,0.1)" }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p.id, p.name)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ color: "#f87171", border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.05)" }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
