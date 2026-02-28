import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import type { Post } from "@/lib/api";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const resolvedParams = await params;
    const posts = readJSON<Post[]>("posts.json");
    const post = posts.find((p) => p.slug === resolvedParams.slug);

    if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
}
