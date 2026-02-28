import { NextResponse } from "next/server";
import { readJSON } from "@/lib/jsonStore";
import type { Post } from "@/lib/api";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const posts = readJSON<Post[]>("posts.json");

    const start = (page - 1) * limit;
    const paginated = posts.slice(start, start + limit);

    return NextResponse.json({ posts: paginated, total: posts.length, page });
}
