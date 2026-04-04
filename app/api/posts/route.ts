import { NextResponse } from "next/server";
import { getPostsPage } from "@/lib/store";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;

    const result = await getPostsPage(page, limit);
    return NextResponse.json(result);
}
