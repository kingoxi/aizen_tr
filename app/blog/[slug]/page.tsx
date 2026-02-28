"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPost, type Post } from "@/lib/api";
import Link from "next/link";

export default function BlogDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getPost(slug)
            .then(setPost)
            .catch(() => setError("Post not found"))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#f1f5f9" }}>404</h1>
                <p style={{ color: "#64748b" }}>Post not found</p>
                <Link href="/blog" className="mt-4 btn-neon px-6 py-2 rounded-lg">
                    Back to Blog
                </Link>
            </div>
        );
    }

    const date = new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
    });

    return (
        <div className="min-h-screen" style={{ background: "var(--color-dark-900)" }}>
            {/* Cover */}
            {post.cover_image && !post.cover_image.includes("placeholder") && (
                <div
                    className="w-full h-72 sm:h-96 relative overflow-hidden"
                    style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.4), rgba(59,130,246,0.2))",
                    }}
                >
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        style={{ opacity: 0.7 }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to bottom, transparent 30%, var(--color-dark-900))" }}
                    />
                </div>
            )}

            {/* Article */}
            <article className="max-w-3xl mx-auto px-4 py-12">
                <Link
                    href="/blog"
                    className="flex items-center gap-2 text-sm mb-8 transition-colors"
                    style={{ color: "#64748b",width: "fit-content" }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Blog
                </Link>

                <time className="text-sm font-medium text-end" style={{ color: "#7c3aed" }}>{date}</time>
                <h1
                    className="text-3xl sm:text-4xl font-black mt-2 mb-8"
                    style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)", lineHeight: 1.25 }}
                >
                    {post.title}
                </h1>

                {/* Divider */}
                <div className="w-24 h-0.5 mb-8" style={{ background: "linear-gradient(90deg, #7c3aed, transparent)" }} />

                {/* IMG */}
                <img src={post.cover_image} alt={post.title} style={{borderRadius:"20px",border:"1px solid #7c3aed"}} className="mb-8 w-auto object-cover" />
                {/* Markdown content */}
                <div className="prose-anime max-w-none text-base leading-relaxed space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
                </div>
            </article>
        </div>
    );
}
