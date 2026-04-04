import { NextResponse } from "next/server";
import { listContacts } from "@/lib/dataStore";
import { authMiddleware } from "@/lib/auth";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const contacts = await listContacts();
    return NextResponse.json(contacts);
}
