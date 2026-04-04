import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/dataStore";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const resolvedParams = await params;
    const project = await getProjectBySlug(resolvedParams.slug);

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
}
