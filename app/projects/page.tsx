import { getServerProjects, getServerSettings } from "@/lib/serverApi";
import ProjectCard from "@/components/ProjectCard";
import type { Metadata } from "next";
import type { Project } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "Projects",
        description: "A showcase of my latest projects in software and robotics.",
    };
}

export default async function ProjectsPage() {
    const projects = await getServerProjects();

    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#06b6d4" }}>
                        Portfolio
                    </p>
                    <h1
                        className="text-4xl sm:text-5xl font-black mb-4"
                        style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}
                    >
                        Projects
                    </h1>
                    <p style={{ color: "#64748b" }}>Things I&apos;ve built with code and creativity</p>
                </div>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p: Project) => (
                            <ProjectCard key={p.id} project={p} />
                        ))}
                    </div>
                ) : (
                    <div
                        className="text-center py-24 rounded-2xl"
                        style={{ background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.2)" }}
                    >
                        <p style={{ color: "#64748b" }}>No projects yet. Stay tuned.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
