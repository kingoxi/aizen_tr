import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware } from "@/lib/auth";
import type { Post } from "@/lib/api";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const resolvedParams = await params;
        const body = await request.json();
        const posts = readJSON<Post[]>("posts.json");
        const idx = posts.findIndex((p) => p.id === resolvedParams.id);

        if (idx === -1) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const { title, slug, excerpt, content, cover_image } = body;

        posts[idx] = {
            ...posts[idx],
            title: title || posts[idx].title,
            slug: slug || posts[idx].slug,
            excerpt: excerpt ?? posts[idx].excerpt,
            content: content || posts[idx].content,
            cover_image: cover_image ?? posts[idx].cover_image,
            updated_at: new Date().toISOString(),
        };

        writeJSON("posts.json", posts);
        return NextResponse.json(posts[idx]);
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const resolvedParams = await params;
    const posts = readJSON<Post[]>("posts.json");
    const filtered = posts.filter((p) => p.id !== resolvedParams.id);

    if (filtered.length === posts.length) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    writeJSON("posts.json", filtered);
    return NextResponse.json({ ok: true });
}
