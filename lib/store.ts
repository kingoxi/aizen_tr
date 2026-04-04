import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import type { Firestore } from "firebase-admin/firestore";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "./defaults";
import type { Contact, Post, Project, SiteSettings } from "./api";
import { readJSON, writeJSON } from "./jsonStore";
import { getFirebaseAdminFirestore } from "./firebaseAdmin";

type JsonUser = {
    id: string;
    username: string;
    password: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
};

export type AdminUser = {
    id: string;
    username: string;
    password: string;
    role: string;
    created_at: string;
    updated_at: string;
};

type Backend = "firestore" | "json";

function isFirestoreConnectionError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    // Covers missing credentials/env, network issues, and gRPC transport failures.
    return (
        message.includes("Could not load the default credentials") ||
        message.includes("ENOTFOUND") ||
        message.includes("ECONNRESET") ||
        message.includes("ETIMEDOUT") ||
        message.includes("EAI_AGAIN") ||
        message.includes("UNAVAILABLE") ||
        message.includes("14 UNAVAILABLE") ||
        message.includes("PERMISSION_DENIED") ||
        message.includes("permission-denied") ||
        message.includes("Missing or insufficient permissions")
    );
}

async function withFirestoreFallback<T>(
    operationName: string,
    firestoreFn: (db: Firestore) => Promise<T>,
    jsonFn: () => Promise<T> | T
): Promise<T> {
    try {
        const db = getFirebaseAdminFirestore();
        await ensureFirestoreSeeded(db);
        return await firestoreFn(db);
    } catch (error) {
        if (!isFirestoreConnectionError(error)) {
            throw error;
        }
        console.error(`[store] Firestore unavailable for ${operationName}; falling back to JSON.`, error);
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
    if (Array.isArray(raw)) return DEFAULT_SITE_SETTINGS;
    return normalizeSiteSettings(raw);
}

function normalizePost(input: Post): Post {
    return {
        ...input,
        excerpt: input.excerpt || "",
        cover_image: input.cover_image || "",
        metaTitle: input.metaTitle || "",
        metaDescription: input.metaDescription || "",
        metaKeywords: input.metaKeywords || "",
    };
}

function normalizeProject(input: Project): Project {
    return {
        ...input,
        description: input.description || "",
        cover_image: input.cover_image || "",
        gallery: Array.isArray(input.gallery) ? input.gallery : [],
        project_url: input.project_url || "",
        github_url: input.github_url || "",
        root_path: input.root_path || "",
        metaTitle: input.metaTitle || "",
        metaDescription: input.metaDescription || "",
        metaKeywords: input.metaKeywords || "",
    };
}

function asAdminUser(user: JsonUser): AdminUser {
    const now = new Date().toISOString();
    return {
        id: user.id,
        username: user.username,
        password: user.password,
        role: user.role || "admin",
        created_at: user.created_at || now,
        updated_at: user.updated_at || user.created_at || now,
    };
}

let firestoreSeedPromise: Promise<void> | null = null;

async function ensureFirestoreSeeded(db: Firestore): Promise<void> {
    if (firestoreSeedPromise) return firestoreSeedPromise;

    firestoreSeedPromise = (async () => {
        // Settings (single doc)
        const settingsRef = db.collection("settings").doc("site");
        const settingsSnap = await settingsRef.get();
        if (!settingsSnap.exists) {
            const settings = readSettingsJson();
            await settingsRef.set({
                ...settings,
                updated_at: new Date().toISOString(),
            });
        }

        // Collections: only seed if empty
        const postsPeek = await db.collection("posts").limit(1).get();
        if (postsPeek.empty) {
            const posts = readPostsJson().map(normalizePost);
            const batch = db.batch();
            for (const post of posts) {
                batch.set(db.collection("posts").doc(post.id), post);
            }
            if (posts.length > 0) await batch.commit();
        }

        const projectsPeek = await db.collection("projects").limit(1).get();
        if (projectsPeek.empty) {
            const projects = readProjectsJson().map(normalizeProject);
            const batch = db.batch();
            for (const project of projects) {
                batch.set(db.collection("projects").doc(project.id), project);
            }
            if (projects.length > 0) await batch.commit();
        }

        const contactsPeek = await db.collection("contacts").limit(1).get();
        if (contactsPeek.empty) {
            const contacts = readContactsJson();
            const batch = db.batch();
            for (const contact of contacts) {
                batch.set(db.collection("contacts").doc(contact.id), contact);
            }
            if (contacts.length > 0) await batch.commit();
        }

        const usersPeek = await db.collection("users").limit(1).get();
        if (usersPeek.empty) {
            const users = readUsersJson();
            const batch = db.batch();
            for (const user of users) {
                batch.set(db.collection("users").doc(user.id), asAdminUser(user));
            }
            if (users.length > 0) await batch.commit();
        }

        // Ensure bootstrap admin exists (does NOT overwrite existing user)
        const bootstrapUsername = process.env.ADMIN_USERNAME || "admin";
        const bootstrapPassword = process.env.ADMIN_PASSWORD || "admin123";
        const existing = await db.collection("users").where("username", "==", bootstrapUsername).limit(1).get();
        if (existing.empty) {
            const now = new Date().toISOString();
            const passwordHash = await bcrypt.hash(bootstrapPassword, 12);
            const id = uuidv4();
            await db.collection("users").doc(id).set({
                id,
                username: bootstrapUsername,
                password: passwordHash,
                role: "admin",
                created_at: now,
                updated_at: now,
            });
        }
    })().catch((error) => {
        firestoreSeedPromise = null;
        throw error;
    });

    return firestoreSeedPromise;
}

export async function getSettings(): Promise<SiteSettings> {
    return withFirestoreFallback(
        "getSettings",
        async (db) => {
            const snap = await db.collection("settings").doc("site").get();
            const data = snap.data() as Partial<SiteSettings> | undefined;
            if (!data) return DEFAULT_SITE_SETTINGS;
            return normalizeSiteSettings(data);
        },
        async () => readSettingsJson()
    );
}

export async function updateSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
    return withFirestoreFallback(
        "updateSettings",
        async (db) => {
            const settings = normalizeSiteSettings(input);
            await db.collection("settings").doc("site").set(
                {
                    ...settings,
                    updated_at: new Date().toISOString(),
                },
                { merge: true }
            );
            return settings;
        },
        async () => {
            const settings = normalizeSiteSettings(input);
            writeJSON("settings.json", settings);
            return settings;
        }
    );
}

export async function listPosts(): Promise<Post[]> {
    return withFirestoreFallback(
        "listPosts",
        async (db) => {
            const snap = await db.collection("posts").orderBy("created_at", "desc").get();
            return snap.docs.map((doc) => normalizePost(doc.data() as Post));
        },
        async () => readPostsJson()
    );
}

export async function getPostsPage(page: number, limit: number): Promise<{ posts: Post[]; total: number; page: number }> {
    return withFirestoreFallback(
        "getPostsPage",
        async (db) => {
            const offset = Math.max(0, (page - 1) * limit);

            const [itemsSnap, totalSnap] = await Promise.all([
                db.collection("posts").orderBy("created_at", "desc").offset(offset).limit(limit).get(),
                db.collection("posts").count().get(),
            ]);

            return {
                posts: itemsSnap.docs.map((doc) => normalizePost(doc.data() as Post)),
                total: totalSnap.data().count,
                page,
            };
        },
        async () => {
            const posts = readPostsJson();
            const start = Math.max(0, (page - 1) * limit);
            return { posts: posts.slice(start, start + limit), total: posts.length, page };
        }
    );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    return withFirestoreFallback(
        "getPostBySlug",
        async (db) => {
            const snap = await db.collection("posts").where("slug", "==", slug).limit(1).get();
            if (snap.empty) return null;
            return normalizePost(snap.docs[0]!.data() as Post);
        },
        async () => readPostsJson().find((post) => post.slug === slug) || null
    );
}

export async function getPostById(id: string): Promise<Post | null> {
    return withFirestoreFallback(
        "getPostById",
        async (db) => {
            const snap = await db.collection("posts").doc(id).get();
            if (!snap.exists) return null;
            return normalizePost(snap.data() as Post);
        },
        async () => readPostsJson().find((post) => post.id === id) || null
    );
}

export async function createPost(post: Post): Promise<Post> {
    return withFirestoreFallback(
        "createPost",
        async (db) => {
            const existing = await db.collection("posts").where("slug", "==", post.slug).limit(1).get();
            if (!existing.empty) {
                throw new Error("Slug already exists");
            }
            const normalized = normalizePost(post);
            await db.collection("posts").doc(normalized.id).set(normalized);
            return normalized;
        },
        async () => {
            const posts = readPostsJson();
            if (posts.find((p) => p.slug === post.slug)) throw new Error("Slug already exists");
            const normalized = normalizePost(post);
            posts.unshift(normalized);
            writeJSON("posts.json", posts);
            return normalized;
        }
    );
}

export async function updatePost(id: string, changes: Partial<Post>): Promise<Post | null> {
    return withFirestoreFallback(
        "updatePost",
        async (db) => {
            if (changes.slug) {
                const existing = await db.collection("posts").where("slug", "==", changes.slug).limit(1).get();
                if (!existing.empty && existing.docs[0]!.id !== id) {
                    throw new Error("Slug already exists");
                }
            }

            const ref = db.collection("posts").doc(id);
            const snap = await ref.get();
            if (!snap.exists) return null;

            const next: Post = normalizePost({
                ...(snap.data() as Post),
                ...changes,
                updated_at: new Date().toISOString(),
            });

            await ref.set(next, { merge: true });
            return next;
        },
        async () => {
            const posts = readPostsJson();
            const index = posts.findIndex((p) => p.id === id);
            if (index === -1) return null;
            if (changes.slug && posts.some((p) => p.slug === changes.slug && p.id !== id)) {
                throw new Error("Slug already exists");
            }
            posts[index] = normalizePost({ ...posts[index], ...changes, updated_at: new Date().toISOString() });
            writeJSON("posts.json", posts);
            return posts[index];
        }
    );
}

export async function deletePost(id: string): Promise<boolean> {
    return withFirestoreFallback(
        "deletePost",
        async (db) => {
            const ref = db.collection("posts").doc(id);
            const snap = await ref.get();
            if (!snap.exists) return false;
            await ref.delete();
            return true;
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
    return withFirestoreFallback(
        "listProjects",
        async (db) => {
            const snap = await db.collection("projects").orderBy("created_at", "desc").get();
            return snap.docs.map((doc) => normalizeProject(doc.data() as Project));
        },
        async () => readProjectsJson()
    );
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    return withFirestoreFallback(
        "getProjectBySlug",
        async (db) => {
            const snap = await db.collection("projects").where("slug", "==", slug).limit(1).get();
            if (snap.empty) return null;
            return normalizeProject(snap.docs[0]!.data() as Project);
        },
        async () => readProjectsJson().find((project) => project.slug === slug) || null
    );
}

export async function getProjectById(id: string): Promise<Project | null> {
    return withFirestoreFallback(
        "getProjectById",
        async (db) => {
            const snap = await db.collection("projects").doc(id).get();
            if (!snap.exists) return null;
            return normalizeProject(snap.data() as Project);
        },
        async () => readProjectsJson().find((project) => project.id === id) || null
    );
}

export async function createProject(project: Project): Promise<Project> {
    return withFirestoreFallback(
        "createProject",
        async (db) => {
            const existing = await db.collection("projects").where("slug", "==", project.slug).limit(1).get();
            if (!existing.empty) throw new Error("Slug already exists");
            const normalized = normalizeProject(project);
            await db.collection("projects").doc(normalized.id).set(normalized);
            return normalized;
        },
        async () => {
            const projects = readProjectsJson();
            if (projects.find((p) => p.slug === project.slug)) throw new Error("Slug already exists");
            const normalized = normalizeProject(project);
            projects.unshift(normalized);
            writeJSON("projects.json", projects);
            return normalized;
        }
    );
}

export async function updateProject(id: string, changes: Partial<Project>): Promise<Project | null> {
    return withFirestoreFallback(
        "updateProject",
        async (db) => {
            if (changes.slug) {
                const existing = await db.collection("projects").where("slug", "==", changes.slug).limit(1).get();
                if (!existing.empty && existing.docs[0]!.id !== id) {
                    throw new Error("Slug already exists");
                }
            }

            const ref = db.collection("projects").doc(id);
            const snap = await ref.get();
            if (!snap.exists) return null;

            const next: Project = normalizeProject({
                ...(snap.data() as Project),
                ...changes,
                updated_at: new Date().toISOString(),
            });

            await ref.set(next, { merge: true });
            return next;
        },
        async () => {
            const projects = readProjectsJson();
            const index = projects.findIndex((p) => p.id === id);
            if (index === -1) return null;
            if (changes.slug && projects.some((p) => p.slug === changes.slug && p.id !== id)) {
                throw new Error("Slug already exists");
            }
            projects[index] = normalizeProject({ ...projects[index], ...changes, updated_at: new Date().toISOString() });
            writeJSON("projects.json", projects);
            return projects[index];
        }
    );
}

export async function deleteProject(id: string): Promise<boolean> {
    return withFirestoreFallback(
        "deleteProject",
        async (db) => {
            const ref = db.collection("projects").doc(id);
            const snap = await ref.get();
            if (!snap.exists) return false;
            await ref.delete();
            return true;
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
    return withFirestoreFallback(
        "listContacts",
        async (db) => {
            const snap = await db.collection("contacts").orderBy("created_at", "desc").get();
            return snap.docs.map((doc) => doc.data() as Contact);
        },
        async () => readContactsJson()
    );
}

export async function createContact(contact: Contact): Promise<Contact> {
    return withFirestoreFallback(
        "createContact",
        async (db) => {
            await db.collection("contacts").doc(contact.id).set(contact);
            return contact;
        },
        async () => {
            const contacts = readContactsJson();
            contacts.unshift(contact);
            writeJSON("contacts.json", contacts);
            return contact;
        }
    );
}

export async function findUserByUsername(username: string): Promise<AdminUser | null> {
    return withFirestoreFallback(
        "findUserByUsername",
        async (db) => {
            const snap = await db.collection("users").where("username", "==", username).limit(1).get();
            if (snap.empty) return null;
            return snap.docs[0]!.data() as AdminUser;
        },
        async () => {
            const users = readUsersJson();
            const user = users.find((u) => u.username === username);
            return user ? asAdminUser(user) : null;
        }
    );
}

export async function findUserById(id: string): Promise<AdminUser | null> {
    return withFirestoreFallback(
        "findUserById",
        async (db) => {
            const snap = await db.collection("users").doc(id).get();
            if (!snap.exists) return null;
            return snap.data() as AdminUser;
        },
        async () => {
            const users = readUsersJson();
            const user = users.find((u) => u.id === id);
            return user ? asAdminUser(user) : null;
        }
    );
}

export async function updateUser(id: string, updates: { username?: string; password?: string }): Promise<AdminUser | null> {
    return withFirestoreFallback(
        "updateUser",
        async (db) => {
            if (updates.username) {
                const existing = await db.collection("users").where("username", "==", updates.username).limit(1).get();
                if (!existing.empty && (existing.docs[0]!.data() as AdminUser).id !== id) {
                    throw new Error("Username already taken");
                }
            }

            const ref = db.collection("users").doc(id);
            const snap = await ref.get();
            if (!snap.exists) return null;

            const current = snap.data() as AdminUser;
            const next: AdminUser = {
                ...current,
                username: updates.username || current.username,
                password: updates.password || current.password,
                updated_at: new Date().toISOString(),
            };
            await ref.set(next, { merge: true });
            return next;
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
            return asAdminUser(users[index]);
        }
    );
}

export async function getDbHealth(): Promise<{
    ok: boolean;
    backend: Backend;
    projectId?: string;
    counts?: { posts: number; projects: number; contacts: number; users: number };
    error?: string;
}> {
    try {
        const db = getFirebaseAdminFirestore();
        await ensureFirestoreSeeded(db);

        const [postsCount, projectsCount, contactsCount, usersCount] = await Promise.all([
            db.collection("posts").count().get(),
            db.collection("projects").count().get(),
            db.collection("contacts").count().get(),
            db.collection("users").count().get(),
        ]);

        return {
            ok: true,
            backend: "firestore",
            projectId: process.env.FIREBASE_PROJECT_ID,
            counts: {
                posts: postsCount.data().count,
                projects: projectsCount.data().count,
                contacts: contactsCount.data().count,
                users: usersCount.data().count,
            },
        };
    } catch (error) {
        if (!isFirestoreConnectionError(error)) {
            return {
                ok: false,
                backend: "firestore",
                projectId: process.env.FIREBASE_PROJECT_ID,
                error: error instanceof Error ? error.message : "Firestore error",
            };
        }

        return {
            ok: true,
            backend: "json",
            projectId: process.env.FIREBASE_PROJECT_ID,
            counts: {
                posts: readPostsJson().length,
                projects: readProjectsJson().length,
                contacts: readContactsJson().length,
                users: readUsersJson().length,
            },
            error: error instanceof Error ? error.message : "Firestore unavailable; using JSON",
        };
    }
}
