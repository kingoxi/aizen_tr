"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    adminGetPosts,
    adminCreatePost,
    adminUpdatePost,
    adminUpload,
    type Post,
} from "@/lib/api";

export default function PostFormPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const isNew = id === "new";

    const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", cover_image: "" });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [originalPost, setOriginalPost] = useState<Post | null>(null);



    useEffect(() => {
        if (!isNew) {
            adminGetPosts()
                .then((posts) => {
                    const p = posts.find((p) => p.id === id);
                    if (!p) { router.push("/admin/posts"); return; }
                    setOriginalPost(p);
                    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt, content: p.content, cover_image: p.cover_image });
                })
                .catch(() => router.push("/admin/login"))
                .finally(() => setLoading(false));
        }
    }, [id, isNew, router]);

    const autoSlug = (title: string) =>
        title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = e.target.value;
        setForm((prev) => ({ ...prev, title: t, slug: isNew ? autoSlug(t) : prev.slug }));
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await adminUpload(file, "posts", form.slug || "misc");
            setForm((p) => ({ ...p, cover_image: res.url }));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await adminCreatePost(form);
            } else {
                await adminUpdatePost(id, form);
            }
            router.push("/admin/posts");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Save failed");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/posts" className="text-sm flex items-center gap-1 mb-1" style={{ color: "#64748b" }}>
                            ← Back to Posts
                        </Link>
                        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            {isNew ? "New Post" : "Edit Post"}
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 p-4 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Title *</label>
                        <input value={form.title} onChange={handleTitleChange} className="neon-input" placeholder="Post title" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Slug *</label>
                        <input
                            value={form.slug}
                            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                            className="neon-input"
                            placeholder="post-url-slug"
                            required
                            pattern="[a-z0-9-]+"
                            title="Lowercase letters, numbers, and hyphens only"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                            className="neon-input"
                            rows={2}
                            placeholder="Short summary shown in post cards"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Cover Image</label>
                        <div className="flex gap-3 items-start">
                            <input
                                value={form.cover_image}
                                onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                                className="neon-input flex-1"
                                placeholder="/uploads/posts/slug/image.jpg"
                            />
                            <label className="cursor-pointer px-4 py-3 rounded-lg text-sm font-medium shrink-0" style={{ border: "1px solid rgba(124,58,237,0.4)", color: "#a78bfa", background: "rgba(124,58,237,0.08)" }}>
                                {uploading ? "Uploading..." : "Upload"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                            </label>
                        </div>
                        {form.cover_image && !form.cover_image.includes("placeholder") && (
                            <img src={`${form.cover_image}`} alt="cover preview" className="mt-2 max-h-32 rounded-lg object-cover" />
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Content (Markdown) *</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                            className="neon-input font-mono text-sm"
                            rows={18}
                            placeholder="# Your post title&#10;&#10;Write in **markdown**..."
                            required
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving} className="btn-neon px-8 py-3 rounded-lg">
                            {saving ? "Saving..." : isNew ? "Publish Post" : "Save Changes"}
                        </button>
                        <Link
                            href="/admin/posts"
                            className="px-6 py-3 rounded-lg text-sm font-medium"
                            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
