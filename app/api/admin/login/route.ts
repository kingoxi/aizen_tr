import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Rate limiting map (IP -> { count, windowStart })
const rateLimits = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = rateLimits.get(ip);

    if (!record || now - record.windowStart > WINDOW_MS) {
        rateLimits.set(ip, { count: 1, windowStart: now });
        return true;
    }

    if (record.count >= MAX_ATTEMPTS) {
        return false;
    }

    record.count++;
    return true;
}

export async function POST(request: Request) {
    // Basic IP tracking from headers (Next.js specific)
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";

    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: "Too many login attempts. Try again later." },
            { status: 429 }
        );
    }

    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json(
                { error: "Username and password required" },
                { status: 400 }
            );
        }

        const users = readJSON<any[]>("users.json");
        const user = users.find((u) => u.username === username);

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = signToken({ id: user.id, username: user.username, role: "admin" });

        const response = NextResponse.json({ ok: true, username: user.username });

        // Set HttpOnly cookie
        response.cookies.set({
            name: "adminToken",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
            path: "/",
        });

        return response;
    } catch {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
}
