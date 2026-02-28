"use client";
import { useRouter } from "next/navigation";

interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    project_url: string;
    github_url: string;
}



export default function ProjectCard({ project }: { project: Project }) {
    const router = useRouter();
    return (
        <div
            onClick={() => router.push(`/projects/${project.slug}`)}
            className="block group cursor-pointer"
        >
            <article
                className="glass-card rounded-xl overflow-hidden h-full flex flex-col"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                {/* Cover */}
                <div className="w-full h-48 overflow-hidden relative" style={{ background: "rgba(6,182,212,0.1)" }}>
                    {project.cover_image && !project.cover_image.includes("placeholder") ? (
                        <img
                            src={project.cover_image}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                    )}
                    <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(13,15,26,0.8) 0%, transparent 50%)" }}
                    />

                    {/* Quick links overlay */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md text-white"
                                style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                            </a>
                        )}
                        {project.project_url && (
                            <a
                                href={project.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1.5 rounded-md text-white"
                                style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <h2
                        className="text-lg font-bold mb-2 transition-colors duration-200 group-hover:text-cyan-400"
                        style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)", lineHeight: 1.3 }}
                    >
                        {project.name}
                    </h2>
                    <p className="text-sm flex-1 line-clamp-3" style={{ color: "#94a3b8", lineHeight: 1.6 }}>
                        {project.description}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: "#06b6d4" }}>
                        View Project
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </article>
        </div>
    );
}
