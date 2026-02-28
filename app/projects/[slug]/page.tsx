"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProject, type Project } from "@/lib/api";
import Link from "next/link";

export default function ProjectDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [galleryIdx, setGalleryIdx] = useState(0);

    useEffect(() => {
        getProject(slug)
            .then(setProject)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#f1f5f9" }}>404</h1>
                <p style={{ color: "#64748b" }}>Project not found</p>
                <Link href="/projects" className="mt-4 btn-neon px-6 py-2 rounded-lg">Back to Projects</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: "var(--color-dark-900)" }}>
            {/* Hero cover */}
            <div
                className="w-full h-64 sm:h-80 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.3), rgba(59,130,246,0.2))" }}
            >
                {project.cover_image && !project.cover_image.includes("placeholder") && (
                    <img
                        src={project.cover_image}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        style={{ opacity: 0.6 }}
                    />
                )}
                <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 30%, var(--color-dark-900))" }}
                />
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-sm mb-8"
                    style={{ color: "#64748b" }}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Projects
                </Link>

                <h1
                    className="text-3xl sm:text-4xl font-black mb-4"
                    style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}
                >
                    {project.name}
                </h1>
                <div className="w-24 h-0.5 mb-6" style={{ background: "linear-gradient(90deg, #06b6d4, transparent)" }} />

                <p className="text-base leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
                    {project.description}
                </p>

                 {/* IMG */}
                <div className="flex justify-center">
                <img src={project.cover_image} alt={project.name} style={{borderRadius:"20px",border:"1px solid #7c3aed"}} className="mb-8 w-100 object-cover" />
                </div>

                {/* Action links */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {project.project_url && (
                        <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-neon px-6 py-2.5 rounded-lg text-sm inline-flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Live Demo
                        </a>
                    )}
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 rounded-lg text-sm inline-flex items-center gap-2 font-semibold"
                            style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(255,255,255,0.2)",
                                color: "#e2e8f0",
                            }}
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                    )}
                </div>

                {/* Gallery */}
                {project.gallery && project.gallery.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold mb-4" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                           Project Gallery
                        </h2>
                        <div className="rounded-xl overflow-hidden mb-4" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(6,182,212,0.2)" }}>
                            <img
                                src={project.gallery[galleryIdx]}
                                alt={`Gallery ${galleryIdx + 1}`}
                                className="w-full max-h-96 object-contain"
                            />
                        </div>
                        {project.gallery.length > 1 && (
                            <div className="flex gap-2 flex-wrap">
                                {project.gallery.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setGalleryIdx(i)}
                                        className="w-16 h-16 rounded-lg overflow-hidden transition-all duration-200"
                                        style={{
                                            border: i === galleryIdx ? "2px solid #06b6d4" : "2px solid rgba(255,255,255,0.1)",
                                            opacity: i === galleryIdx ? 1 : 0.6,
                                        }}
                                    >
                                        <img src={img} alt={`thumb ${i}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
