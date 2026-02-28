"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    adminGetPosts,
    adminDeletePost,
    type Post,
} from "@/lib/api";

export default function AdminPostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(() => {
        adminGetPosts()
            .then(setPosts)
            .catch(() => router.push("/admin/login"))
            .finally(() => setLoading(false));
    }, [router]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        await adminDeletePost(id);
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
                            Manage Posts
                        </h1>
                    </div>
                    <Link href="/admin/posts/new" className="btn-neon px-5 py-2.5 rounded-lg text-sm">
                        + New Post
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "rgba(124,58,237,0.05)" }} />
                        ))}
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-2xl">
                        <p style={{ color: "#64748b" }}>No posts yet. Create your first post!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {posts.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center justify-between p-4 rounded-xl"
                                style={{
                                    background: "rgba(124,58,237,0.05)",
                                    border: "1px solid rgba(124,58,237,0.15)",
                                }}
                            >
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate" style={{ color: "#f1f5f9" }}>{p.title}</h3>
                                    <p className="text-sm" style={{ color: "#64748b" }}>
                                        /blog/{p.slug} · {new Date(p.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4 shrink-0">
                                    <Link
                                        href={`/blog/${p.slug}`}
                                        target="_blank"
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={`/admin/posts/${p.id}`}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)", background: "rgba(124,58,237,0.1)" }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p.id, p.title)}
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
