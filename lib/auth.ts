import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

export function signToken(payload: object) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

export async function authMiddleware(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return null; // returning null means authorized
}

export async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("adminToken")?.value;
    if (!token) return null;
    return verifyToken(token) as { id: string; username: string; role: string } | null;
}
