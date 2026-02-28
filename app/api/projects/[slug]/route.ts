import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import type { Project } from "@/lib/api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const resolvedParams = await params;
    const projects = readJSON<Project[]>("projects.json");
    const project = projects.find((p) => p.slug === resolvedParams.slug);

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
}
