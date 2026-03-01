import { readJSON } from "./jsonStore";
import type { Post, Project, SiteSettings } from "./api";

/**
 * Direct server-side data access functions to avoid relative URL fetch issues 
 * in Server Components and generateMetadata.
 */

export async function getServerSettings(): Promise<SiteSettings | null> {
    try {
        const settings = readJSON<any>("settings.json");
        if (Array.isArray(settings) && settings.length === 0) return null;
        return settings as SiteSettings;
    } catch {
        return null;
    }
}

export async function getServerPosts(): Promise<Post[]> {
    try {
        const posts = readJSON<Post[]>("posts.json");
        return Array.isArray(posts) ? posts : [];
    } catch {
        return [];
    }
}

export async function getServerPost(slug: string): Promise<Post | null> {
    try {
        const posts = await getServerPosts();
        return posts.find(p => p.slug === slug) || null;
    } catch {
        return null;
    }
}

export async function getServerProjects(): Promise<Project[]> {
    try {
        const projects = readJSON<Project[]>("projects.json");
        return Array.isArray(projects) ? projects : [];
    } catch {
        return [];
    }
}

export async function getServerProject(slug: string): Promise<Project | null> {
    try {
        const projects = await getServerProjects();
        return projects.find(p => p.slug === slug) || null;
    } catch {
        return null;
    }
}
