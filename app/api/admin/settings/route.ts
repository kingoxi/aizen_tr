import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/dataStore";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const settings = await getSettings();
    return NextResponse.json(settings);
}

export async function PUT(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const settings = await updateSettings(body);
        return NextResponse.json(settings, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
