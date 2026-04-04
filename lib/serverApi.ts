import type { Post, Project, SiteSettings } from "./api";
import {
    getPostBySlug,
    getProjectBySlug,
    getSettings,
    listPosts,
    listProjects,
} from "./dataStore";

/**
 * Direct server-side data access functions to avoid relative URL fetch issues 
 * in Server Components and generateMetadata.
 */

export async function getServerSettings(): Promise<SiteSettings | null> {
    try {
        return await getSettings();
    } catch {
        return null;
    }
}

export async function getServerPosts(): Promise<Post[]> {
    try {
        return await listPosts();
    } catch {
        return [];
    }
}

export async function getServerPost(slug: string): Promise<Post | null> {
    try {
        return await getPostBySlug(slug);
    } catch {
        return null;
    }
}

export async function getServerProjects(): Promise<Project[]> {
    try {
        return await listProjects();
    } catch {
        return [];
    }
}

export async function getServerProject(slug: string): Promise<Project | null> {
    try {
        return await getProjectBySlug(slug);
    } catch {
        return null;
    }
}
