import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import type { Post } from "@/lib/api";

export async function GET(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const posts = readJSON<Post[]>("posts.json");
    return NextResponse.json(posts);
}

export async function POST(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const body = await request.json();
        const { title, slug, excerpt, content, cover_image } = body;

        if (!title || !slug || !content) {
            return NextResponse.json(
                { error: "title, slug, and content are required" },
                { status: 400 }
            );
        }

        const posts = readJSON<Post[]>("posts.json");
        if (posts.find((p) => p.slug === slug)) {
            return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
        }

        const now = new Date().toISOString();
        const post: Post = {
            id: uuidv4(),
            title,
            slug,
            excerpt: excerpt || "",
            content,
            cover_image: cover_image || "",
            created_at: now,
            updated_at: now,
        };

        posts.unshift(post);
        writeJSON("posts.json", posts);

        return NextResponse.json(post, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}
