import bcrypt from "bcryptjs";
import type { Pool, RowDataPacket } from "mysql2/promise";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "./defaults";
import type { Contact, Post, Project, SiteSettings } from "./api";
import { ensureDatabaseReady, getPool } from "./db";
import * as dbStore from "./dataStore";
import { readJSON, writeJSON } from "./jsonStore";

type JsonUser = {
    id: string;
    username: string;
    password: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
};

function isDbConnectionError(error: unknown): boolean {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    return [
        "ECONNREFUSED",
        "ENOTFOUND",
        "ETIMEDOUT",
        "EHOSTUNREACH",
        "PROTOCOL_CONNECTION_LOST",
        "ER_ACCESS_DENIED_ERROR",
        "ER_BAD_DB_ERROR",
    ].includes(code);
}

async function withDbFallback<T>(operationName: string, dbFn: () => Promise<T>, jsonFn: () => Promise<T> | T): Promise<T> {
    try {
        return await dbFn();
    } catch (error) {
        if (!isDbConnectionError(error)) {
            throw error;
        }
        console.error(`[store] DB unavailable for ${operationName}; falling back to JSON.`, error);
        return await jsonFn();
    }
}

function readPostsJson(): Post[] {
    const posts = readJSON<Post[]>("posts.json");
    return Array.isArray(posts) ? posts : [];
}

function readProjectsJson(): Project[] {
    const projects = readJSON<Project[]>("projects.json");
    return Array.isArray(projects) ? projects : [];
}

function readContactsJson(): Contact[] {
    const contacts = readJSON<Contact[]>("contacts.json");
    return Array.isArray(contacts) ? contacts : [];
}

function readUsersJson(): JsonUser[] {
    const users = readJSON<JsonUser[]>("users.json");
    return Array.isArray(users) ? users : [];
}

function readSettingsJson(): SiteSettings {
    const raw = readJSON<Partial<SiteSettings> | SiteSettings[]>("settings.json");
    if (Array.isArray(raw)) {
        return DEFAULT_SITE_SETTINGS;
    }
    return normalizeSiteSettings(raw);
}

export async function getSettings(): Promise<SiteSettings> {
    return withDbFallback(
        "getSettings",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getSettings();
        },
        async () => readSettingsJson()
    );
}

export async function updateSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
    return withDbFallback(
        "updateSettings",
        async () => {
            await ensureDatabaseReady();
            return dbStore.updateSettings(input);
        },
        async () => {
            const settings = normalizeSiteSettings(input);
            writeJSON("settings.json", settings);
            return settings;
        }
    );
}

export async function listPosts(): Promise<Post[]> {
    return withDbFallback(
        "listPosts",
        async () => {
            await ensureDatabaseReady();
            return dbStore.listPosts();
        },
        async () => readPostsJson()
    );
}

export async function getPostsPage(page: number, limit: number): Promise<{ posts: Post[]; total: number; page: number }> {
    return withDbFallback(
        "getPostsPage",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getPostsPage(page, limit);
        },
        async () => {
            const posts = readPostsJson();
            const start = Math.max(0, (page - 1) * limit);
            return { posts: posts.slice(start, start + limit), total: posts.length, page };
        }
    );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    return withDbFallback(
        "getPostBySlug",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getPostBySlug(slug);
        },
        async () => readPostsJson().find((post) => post.slug === slug) || null
    );
}

export async function getPostById(id: string): Promise<Post | null> {
    return withDbFallback(
        "getPostById",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getPostById(id);
        },
        async () => readPostsJson().find((post) => post.id === id) || null
    );
}

export async function createPost(post: Post): Promise<Post> {
    return withDbFallback(
        "createPost",
        async () => {
            await ensureDatabaseReady();
            return dbStore.createPost(post);
        },
        async () => {
            const posts = readPostsJson();
            if (posts.find((p) => p.slug === post.slug)) {
                throw new Error("Slug already exists");
            }
            posts.unshift(post);
            writeJSON("posts.json", posts);
            return post;
        }
    );
}

export async function updatePost(id: string, changes: Partial<Post>): Promise<Post | null> {
    return withDbFallback(
        "updatePost",
        async () => {
            await ensureDatabaseReady();
            return dbStore.updatePost(id, changes);
        },
        async () => {
            const posts = readPostsJson();
            const index = posts.findIndex((p) => p.id === id);
            if (index === -1) return null;

            if (changes.slug && posts.some((p) => p.slug === changes.slug && p.id !== id)) {
                throw new Error("Slug already exists");
            }

            posts[index] = {
                ...posts[index],
                ...changes,
                updated_at: new Date().toISOString(),
            };
            writeJSON("posts.json", posts);
            return posts[index];
        }
    );
}

export async function deletePost(id: string): Promise<boolean> {
    return withDbFallback(
        "deletePost",
        async () => {
            await ensureDatabaseReady();
            return dbStore.deletePost(id);
        },
        async () => {
            const posts = readPostsJson();
            const filtered = posts.filter((p) => p.id !== id);
            if (filtered.length === posts.length) return false;
            writeJSON("posts.json", filtered);
            return true;
        }
    );
}

export async function listProjects(): Promise<Project[]> {
    return withDbFallback(
        "listProjects",
        async () => {
            await ensureDatabaseReady();
            return dbStore.listProjects();
        },
        async () => readProjectsJson()
    );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    return withDbFallback(
        "getProjectBySlug",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getProjectBySlug(slug);
        },
        async () => readProjectsJson().find((project) => project.slug === slug) || null
    );
}

export async function getProjectById(id: string): Promise<Project | null> {
    return withDbFallback(
        "getProjectById",
        async () => {
            await ensureDatabaseReady();
            return dbStore.getProjectById(id);
        },
        async () => readProjectsJson().find((project) => project.id === id) || null
    );
}

export async function createProject(project: Project): Promise<Project> {
    return withDbFallback(
        "createProject",
        async () => {
            await ensureDatabaseReady();
            return dbStore.createProject(project);
        },
        async () => {
            const projects = readProjectsJson();
            if (projects.find((p) => p.slug === project.slug)) {
                throw new Error("Slug already exists");
            }
            projects.unshift(project);
            writeJSON("projects.json", projects);
            return project;
        }
    );
}

export async function updateProject(id: string, changes: Partial<Project>): Promise<Project | null> {
    return withDbFallback(
        "updateProject",
        async () => {
            await ensureDatabaseReady();
            return dbStore.updateProject(id, changes);
        },
        async () => {
            const projects = readProjectsJson();
            const index = projects.findIndex((p) => p.id === id);
            if (index === -1) return null;

            if (changes.slug && projects.some((p) => p.slug === changes.slug && p.id !== id)) {
                throw new Error("Slug already exists");
            }

            projects[index] = {
                ...projects[index],
                ...changes,
                updated_at: new Date().toISOString(),
            };
            writeJSON("projects.json", projects);
            return projects[index];
        }
    );
}

export async function deleteProject(id: string): Promise<boolean> {
    return withDbFallback(
        "deleteProject",
        async () => {
            await ensureDatabaseReady();
            return dbStore.deleteProject(id);
        },
        async () => {
            const projects = readProjectsJson();
            const filtered = projects.filter((p) => p.id !== id);
            if (filtered.length === projects.length) return false;
            writeJSON("projects.json", filtered);
            return true;
        }
    );
}

export async function listContacts(): Promise<Contact[]> {
    return withDbFallback(
        "listContacts",
        async () => {
            await ensureDatabaseReady();
            return dbStore.listContacts();
        },
        async () => readContactsJson()
    );
}

export async function createContact(contact: Contact): Promise<Contact> {
    return withDbFallback(
        "createContact",
        async () => {
            await ensureDatabaseReady();
            return dbStore.createContact(contact);
        },
        async () => {
            const contacts = readContactsJson();
            contacts.unshift(contact);
            writeJSON("contacts.json", contacts);
            return contact;
        }
    );
}

export async function findUserByUsername(username: string): Promise<dbStore.AdminUser | null> {
    return withDbFallback(
        "findUserByUsername",
        async () => {
            await ensureDatabaseReady();
            return dbStore.findUserByUsername(username);
        },
        async () => {
            const users = readUsersJson();
            const user = users.find((u) => u.username === username);
            if (!user) return null;
            return {
                id: user.id,
                username: user.username,
                password: user.password,
                role: user.role || "admin",
                created_at: user.created_at || new Date().toISOString(),
                updated_at: user.updated_at || user.created_at || new Date().toISOString(),
            };
        }
    );
}

export async function findUserById(id: string): Promise<dbStore.AdminUser | null> {
    return withDbFallback(
        "findUserById",
        async () => {
            await ensureDatabaseReady();
            return dbStore.findUserById(id);
        },
        async () => {
            const users = readUsersJson();
            const user = users.find((u) => u.id === id);
            if (!user) return null;
            return {
                id: user.id,
                username: user.username,
                password: user.password,
                role: user.role || "admin",
                created_at: user.created_at || new Date().toISOString(),
                updated_at: user.updated_at || user.created_at || new Date().toISOString(),
            };
        }
    );
}

export async function updateUser(id: string, updates: { username?: string; password?: string }): Promise<dbStore.AdminUser | null> {
    return withDbFallback(
        "updateUser",
        async () => {
            await ensureDatabaseReady();
            return dbStore.updateUser(id, updates);
        },
        async () => {
            const users = readUsersJson();
            const index = users.findIndex((u) => u.id === id);
            if (index === -1) return null;

            if (updates.username && users.some((u) => u.username === updates.username && u.id !== id)) {
                throw new Error("Username already taken");
            }

            const now = new Date().toISOString();
            users[index] = {
                ...users[index],
                username: updates.username || users[index].username,
                password: updates.password || users[index].password,
                updated_at: now,
            };
            writeJSON("users.json", users);
            return {
                id: users[index].id,
                username: users[index].username,
                password: users[index].password,
                role: users[index].role || "admin",
                created_at: users[index].created_at || now,
                updated_at: users[index].updated_at || now,
            };
        }
    );
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
}

export async function getDbHealth(): Promise<{
    ok: boolean;
    backend: "db" | "json";
    connection?: { host?: string; port?: number; database?: string; user?: string };
    counts?: { posts: number; projects: number; contacts: number; users: number };
    error?: string;
}> {
    const connection = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
        database: process.env.DB_NAME,
        user: process.env.DB_USER || process.env.DB_USERNAME,
    };

    try {
        await ensureDatabaseReady();
        const pool: Pool = await getPool();
        const [rows] = await pool.query<Array<RowDataPacket & { ok: number }>>("SELECT 1 AS ok");
        if (!rows[0] || rows[0].ok !== 1) {
            return { ok: false, backend: "db", connection, error: "Unexpected DB response" };
        }

        const [[counts]] = await pool.query<
            Array<RowDataPacket & { posts: number; projects: number; contacts: number; users: number }>
        >(
            `SELECT
                (SELECT COUNT(*) FROM posts) AS posts,
                (SELECT COUNT(*) FROM projects) AS projects,
                (SELECT COUNT(*) FROM contacts) AS contacts,
                (SELECT COUNT(*) FROM users) AS users`
        );

        return {
            ok: true,
            backend: "db",
            connection,
            counts: {
                posts: Number(counts.posts || 0),
                projects: Number(counts.projects || 0),
                contacts: Number(counts.contacts || 0),
                users: Number(counts.users || 0),
            },
        };
    } catch (error) {
        if (!isDbConnectionError(error)) {
            return {
                ok: false,
                backend: "db",
                connection,
                error: error instanceof Error ? error.message : "DB error",
            };
        }

        return {
            ok: true,
            backend: "json",
            connection,
            counts: {
                posts: readPostsJson().length,
                projects: readProjectsJson().length,
                contacts: readContactsJson().length,
                users: readUsersJson().length,
            },
            error: error instanceof Error ? error.message : "DB unavailable; using JSON",
        };
    }
}
