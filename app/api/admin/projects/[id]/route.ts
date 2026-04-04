import { NextResponse } from "next/server";
import { deleteProject, getProjectBySlug, updateProject } from "@/lib/store";
import { authMiddleware } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const resolvedParams = await params;
        const body = await request.json();
        const { slug } = body as { slug?: string };

        if (slug) {
            const existingProject = await getProjectBySlug(slug);
            if (existingProject && existingProject.id !== resolvedParams.id) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
            }
        }

        const project = await updateProject(resolvedParams.id, body);
        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const resolvedParams = await params;
    const deleted = await deleteProject(resolvedParams.id);
    if (!deleted) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
