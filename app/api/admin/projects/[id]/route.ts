import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";
import type { Project } from "@/lib/api";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const resolvedParams = await params;
        const body = await request.json();
        const projects = readJSON<Project[]>("projects.json");
        const idx = projects.findIndex((p) => p.id === resolvedParams.id);

        if (idx === -1) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        projects[idx] = { ...projects[idx], ...body, updated_at: new Date().toISOString() };
        writeJSON("projects.json", projects);

        return NextResponse.json(projects[idx]);
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
    const projects = readJSON<Project[]>("projects.json");
    const filtered = projects.filter((p) => p.id !== resolvedParams.id);

    if (filtered.length === projects.length) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    writeJSON("projects.json", filtered);
    return NextResponse.json({ ok: true });
}
