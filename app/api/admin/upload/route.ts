import { NextResponse } from "next/server";
import { authMiddleware } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        // Parse the URL search params manually since we stream standard form-data
        const { searchParams } = new URL(request.url);
        const forceType = searchParams.get("type"); // ?type=projects
        const type = forceType === "projects" ? "projects" : "posts";

        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const slug = formData.get("slug")?.toString() || "misc";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Limit File Size to ~5MB
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
        }

        // Only allow specific mimetypes
        const validMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!validMimes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, GIF, WEBP allowed" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate a safe unique filename
        const ext = path.extname(file.name).toLowerCase();
        const uniqueName = `${crypto.randomUUID()}${ext}`;

        // Ensure the directory exists (/app/public/uploads/...)
        const safeSlug = slug.replace(/[^a-z0-9-_]/gi, "_");
        const uploadDir = path.join(process.cwd(), "public", "uploads", type, safeSlug);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Write the file to disk
        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, buffer);

        // Return path relative to /public
        const url = `/uploads/${type}/${safeSlug}/${uniqueName}`;
        return NextResponse.json({ ok: true, url });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Upload failed" },
            { status: 500 }
        );
    }
}
