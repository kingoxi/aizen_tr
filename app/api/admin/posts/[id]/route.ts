import { NextResponse } from "next/server";
import { deletePost, getPostBySlug, updatePost } from "@/lib/dataStore";
import { authMiddleware } from "@/lib/auth";

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    try {
        const resolvedParams = await params;
        const body = await request.json();
        const { slug } = body as { slug?: string };

        if (slug) {
            const existingPost = await getPostBySlug(slug);
            if (existingPost && existingPost.id !== resolvedParams.id) {
                return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
            }
        }

        const post = await updatePost(resolvedParams.id, body);
        if (!post) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json(post);
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
    const deleted = await deletePost(resolvedParams.id);

    if (!deleted) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
