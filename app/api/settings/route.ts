import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";

export async function GET() {
    let settings = readJSON<any>("settings.json");

    // Fallback if file doesn't exist (readJSON returns [] by default)
    if (Array.isArray(settings) && settings.length === 0) {
        settings = {
            aboutContent: "",
            backgroundType: "dynamic",
            backgroundMediaUrl: ""
        };
    }

    return NextResponse.json(settings);
}
