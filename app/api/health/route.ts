import { NextResponse } from "next/server";
import { getDbHealth, getSettings, getPostsPage, listProjects } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
    const health = await getDbHealth();
    const [settings, posts, projects] = await Promise.allSettled([
        getSettings(),
        getPostsPage(1, 1),
        listProjects(),
    ]);

    return NextResponse.json({
        health,
        sample: {
            settings: settings.status === "fulfilled" ? { profileName: settings.value.profileName, metaTitle: settings.value.metaTitle } : null,
            posts: posts.status === "fulfilled" ? { total: posts.value.total } : null,
            projects: projects.status === "fulfilled" ? { count: projects.value.length } : null,
        },
        now: new Date().toISOString(),
    });
}

