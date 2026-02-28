"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    adminGetProjects,
    adminCreateProject,
    adminUpdateProject,
    adminUpload,
    type Project,
} from "@/lib/api";

export default function ProjectFormPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const isNew = id === "new";

    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
        cover_image: "",
        gallery: [] as string[],
        project_url: "",
        github_url: "",
    });
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isNew) {
            adminGetProjects()
                .then((list) => {
                    const p = list.find((p) => p.id === id);
                    if (!p) { router.push("/admin/projects"); return; }
                    setForm({
                        name: p.name, slug: p.slug, description: p.description,
                        cover_image: p.cover_image, gallery: p.gallery || [],
                        project_url: p.project_url, github_url: p.github_url,
                    });
                })
                .catch(() => router.push("/admin/login"))
                .finally(() => setLoading(false));
        }
    }, [id, isNew, router]);

    const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await adminUpload(file, "projects", form.slug || "misc");
            setForm((p) => ({ ...p, cover_image: res.url }));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        // Ensure slug exists for organized uploads
        if (!form.slug) {
            setError("Please enter a name or slug first to organize uploads.");
            return;
        }

        setUploading(true);
        setError("");
        try {
            const urls: string[] = [];
            for (const file of files) {
                const res = await adminUpload(file, "projects", form.slug);
                urls.push(res.url);
            }
            setForm((p) => ({ ...p, gallery: Array.isArray(p.gallery) ? [...p.gallery, ...urls] : [...urls] }));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setUploading(false);
            // Clear the file input so user can upload more later
            e.target.value = "";
        }
    };

    const removeGalleryImg = (idx: number) => {
        setForm((p) => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
    };

    const clearGallery = () => {
        if (confirm("Are you sure you want to clear all gallery images?")) {
            setForm(p => ({ ...p, gallery: [] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isNew) {
                await adminCreateProject(form);
            } else {
                await adminUpdateProject(id, form);
            }
            router.push("/admin/projects");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Save failed");
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/projects" className="text-sm flex items-center gap-1 mb-1" style={{ color: "#64748b" }}>
                            ← Back to Projects
                        </Link>
                        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            {isNew ? "New Project" : "Edit Project"}
                        </h1>
                    </div>
                </div>

                {error && (
                    <div className="mb-5 p-4 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Name *</label>
                            <input
                                value={form.name}
                                onChange={(e) => {
                                    const n = e.target.value;
                                    setForm((p) => ({ ...p, name: n, slug: isNew ? autoSlug(n) : p.slug }));
                                }}
                                className="neon-input"
                                placeholder="My Cool Project"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Slug *</label>
                            <input
                                value={form.slug}
                                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                className="neon-input"
                                placeholder="my-cool-project"
                                required
                                pattern="[a-z0-9-]+"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                            className="neon-input"
                            rows={4}
                            placeholder="Describe the project..."
                            style={{ resize: "vertical" }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Live URL</label>
                            <input
                                value={form.project_url}
                                onChange={(e) => setForm((p) => ({ ...p, project_url: e.target.value }))}
                                className="neon-input"
                                placeholder="https://yourproject.com"
                                type="url"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>GitHub URL</label>
                            <input
                                value={form.github_url}
                                onChange={(e) => setForm((p) => ({ ...p, github_url: e.target.value }))}
                                className="neon-input"
                                placeholder="https://github.com/user/repo"
                                type="url"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: "#94a3b8" }}>Cover Image</label>
                        <div className="flex gap-3 items-center">
                            <input
                                value={form.cover_image}
                                onChange={(e) => setForm((p) => ({ ...p, cover_image: e.target.value }))}
                                className="neon-input flex-1"
                                placeholder="/uploads/projects/slug/cover.jpg"
                            />
                            <label className="cursor-pointer px-4 py-3 rounded-lg text-sm font-medium shrink-0" style={{ border: "1px solid rgba(6,182,212,0.4)", color: "#06b6d4", background: "rgba(6,182,212,0.08)" }}>
                                {uploading ? "..." : "Upload"}
                                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
                            </label>
                        </div>
                        {form.cover_image && !form.cover_image.includes("placeholder") && (
                            <img src={form.cover_image} alt="cover" className="mt-2 max-h-32 rounded-lg object-cover" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-medium" style={{ color: "#94a3b8" }}>Gallery</label>
                            {form.gallery.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearGallery}
                                    className="text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium mb-3 w-full justify-center transition-all hover:brightness-110" style={{ border: "1px dashed rgba(6,182,212,0.4)", color: "#06b6d4", background: "rgba(6,182,212,0.05)" }}>
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add Gallery Images
                                </>
                            )}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryUpload} disabled={uploading} />
                        </label>
                        {form.gallery.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                                {form.gallery.map((url, i) => (
                                    <div key={i} className="relative group">
                                        <img src={url} alt={`gallery ${i}`} className="w-20 h-20 object-cover rounded-lg" style={{ border: "1px solid rgba(6,182,212,0.3)" }} />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImg(i)}
                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: "#ef4444", color: "white" }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={saving} className="btn-neon px-8 py-3 rounded-lg">
                            {saving ? "Saving..." : isNew ? "Create Project" : "Save Changes"}
                        </button>
                        <Link href="/admin/projects" className="px-6 py-3 rounded-lg text-sm font-medium" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
