import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import type { Project } from "@/lib/api";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const projects = readJSON<Project[]>("projects.json");
    return NextResponse.json(projects);
}

export async function POST(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { name, slug, description, project_url, github_url, cover_image, gallery } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: "name and slug are required" }, { status: 400 });
        }

        const projects = readJSON<Project[]>("projects.json");
        if (projects.find((p) => p.slug === slug)) {
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
            created_at: now,
            updated_at: now,
        };

        projects.unshift(project);
        writeJSON("projects.json", projects);

        return NextResponse.json(project, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
