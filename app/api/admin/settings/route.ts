import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    let settings = readJSON<any>("settings.json");

    if (Array.isArray(settings) && settings.length === 0) {
        settings = {
            aboutContent: "",
            backgroundType: "dynamic",
            backgroundMediaUrl: "",
            profileName: "",
            profileTitle: "",
            profileImage: "",
            profileLocation: "",
            profileEmail: "",
            githubUrl: "",
            linkedinUrl: "",
            instagramUrl: "",
            phone: ""
        };
    }
    return NextResponse.json(settings);
}

export async function PUT(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const body = await request.json();

        const settings = {
            aboutContent: body.aboutContent || "",
            backgroundType: body.backgroundType || "dynamic",
            backgroundMediaUrl: body.backgroundMediaUrl || "",
            profileName: body.profileName || "",
            profileTitle: body.profileTitle || "",
            profileImage: body.profileImage || "",
            profileLocation: body.profileLocation || "",
            profileEmail: body.profileEmail || "",
            githubUrl: body.githubUrl || "",
            linkedinUrl: body.linkedinUrl || "",
            instagramUrl: body.instagramUrl || "",
            phone: body.phone || ""
        };

        writeJSON("settings.json", settings);

        return NextResponse.json(settings, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
