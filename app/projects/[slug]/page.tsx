import { getServerProject } from "@/lib/serverApi";
import Link from "next/link";
import { Metadata } from "next";
import ProjectDetailClient from "./ProjectDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const project = await getServerProject(resolvedParams.slug);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    const title = project.metaTitle || `${project.name} | Projects`;

    const metadata: Metadata = {
        title: title,
    };

    if (project.metaDescription || project.description) {
        metadata.description = project.metaDescription || project.description;
    }

    if (project.metaKeywords) {
        metadata.keywords = project.metaKeywords;
    }

    return metadata;
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const project = await getServerProject(resolvedParams.slug);

    if (!project) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#f1f5f9" }}>404</h1>
                <p style={{ color: "#64748b" }}>Project not found</p>
                <Link href="/projects" className="mt-4 btn-neon px-6 py-2 rounded-lg">Back to Projects</Link>
            </div>
        );
    }

    return <ProjectDetailClient project={project} />;
}
