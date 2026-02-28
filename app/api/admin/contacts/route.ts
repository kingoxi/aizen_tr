import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";
import type { Contact } from "@/lib/api";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const contacts = readJSON<Contact[]>("contacts.json");
    return NextResponse.json(contacts);
}
