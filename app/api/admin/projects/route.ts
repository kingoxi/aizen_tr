import { NextResponse } from "next/server";
import { createProject, getProjectBySlug, listProjects } from "@/lib/dataStore";
import { authMiddleware } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import type { Project } from "@/lib/api";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const projects = await listProjects();
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { name, slug, description, project_url, github_url, cover_image, gallery, root_path, metaTitle, metaDescription, metaKeywords } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
        }

        const existingProject = await getProjectBySlug(slug);
        if (existingProject) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        const now = new Date().toISOString();
        const project: Project = {
            id: uuidv4(),
            name,
            slug,
            description: description || "",
            cover_image: cover_image || "",
            gallery: gallery || [],
            project_url: project_url || "",
            github_url: github_url || "",
            root_path: root_path || "",
            created_at: now,
            updated_at: now,
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            metaKeywords: metaKeywords || "",
        };

        await createProject(project);

        return NextResponse.json(project, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
