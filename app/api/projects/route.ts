import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import type { Project } from "@/lib/api";

export async function GET() {
    const projects = readJSON<Project[]>("projects.json");
    return NextResponse.json(projects);
}
