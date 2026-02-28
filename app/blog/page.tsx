"use client";
import { useEffect, useState } from "react";
import { getPosts, type Post } from "@/lib/api";
import PostCard from "@/components/PostCard";
import type { Metadata } from "next";

export default function BlogPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPosts(1, 100)
            .then((r) => setPosts(r.posts))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#7c3aed" }}>
                        Writings
                    </p>
                    <h1
                        className="text-4xl sm:text-5xl font-black mb-4"
                        style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}
                    >
                        The Blog
                    </h1>
                    <p style={{ color: "#64748b" }}>
                        Thoughts, tutorials, and anime deep-dives
                    </p>
                </div>

                {/* Posts grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-xl h-72 animate-pulse"
                                style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.1)" }}
                            />
                        ))}
                    </div>
                ) : posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div
                        className="text-center py-24 rounded-2xl"
                        style={{ background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)" }}
                    >
                        <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p style={{ color: "#64748b" }}>No posts yet. Come back soon.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
