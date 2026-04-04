import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import type { Contact, Post, Project, SiteSettings } from "./api";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "./defaults";
import { ensureDatabaseReady, getPool } from "./db";

export type AdminUser = {
    id: string;
    username: string;
    password: string;
    role: string;
    created_at: string;
    updated_at: string;
};

type PostRow = RowDataPacket & {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    content: string;
    created_at: string;
    updated_at: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
};

type ProjectRow = RowDataPacket & {
    id: string;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    gallery: string;
    project_url: string;
    github_url: string;
    root_path: string;
    created_at: string;
    updated_at: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
};

type ContactRow = RowDataPacket & {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
};

type SettingsRow = RowDataPacket & {
    about_content: string;
    background_type: string;
    background_media_url: string;
    background_media_url_mobile: string;
    profile_name: string;
    profile_title: string;
    profile_image: string;
    profile_location: string;
    profile_email: string;
    github_url: string;
    linkedin_url: string;
    instagram_url: string;
    phone: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    quotes: string;
};

type AdminUserRow = RowDataPacket & AdminUser;
type CountRow = RowDataPacket & { count: number };

function parseStringArray(value: string | null | undefined): string[] {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

function stringifyStringArray(items: string[] | undefined): string {
    return JSON.stringify(Array.isArray(items) ? items : []);
}

function mapPost(row: PostRow): Post {
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt || "",
        cover_image: row.cover_image || "",
        content: row.content,
        created_at: row.created_at,
        updated_at: row.updated_at,
        metaTitle: row.meta_title || "",
        metaDescription: row.meta_description || "",
        metaKeywords: row.meta_keywords || "",
    };
}

function mapProject(row: ProjectRow): Project {
    return {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description || "",
        cover_image: row.cover_image || "",
        gallery: parseStringArray(row.gallery),
        project_url: row.project_url || "",
        github_url: row.github_url || "",
        root_path: row.root_path || "",
        created_at: row.created_at,
        updated_at: row.updated_at,
        metaTitle: row.meta_title || "",
        metaDescription: row.meta_description || "",
        metaKeywords: row.meta_keywords || "",
    };
}

function mapContact(row: ContactRow): Contact {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        subject: row.subject || "",
        message: row.message,
        created_at: row.created_at,
    };
}

function mapSettings(row: SettingsRow | undefined): SiteSettings {
    if (!row) {
        return DEFAULT_SITE_SETTINGS;
    }

    return normalizeSiteSettings({
        aboutContent: row.about_content,
        backgroundType:
            row.background_type === "video" || row.background_type === "none" ? row.background_type : "dynamic",
        backgroundMediaUrl: row.background_media_url,
        backgroundMediaUrlMobile: row.background_media_url_mobile,
        profileName: row.profile_name,
        profileTitle: row.profile_title,
        profileImage: row.profile_image,
        profileLocation: row.profile_location,
        profileEmail: row.profile_email,
        githubUrl: row.github_url,
        linkedinUrl: row.linkedin_url,
        instagramUrl: row.instagram_url,
        phone: row.phone,
        metaTitle: row.meta_title,
        metaDescription: row.meta_description,
        metaKeywords: row.meta_keywords,
        quotes: parseStringArray(row.quotes),
    });
}

function mapAdminUser(row: AdminUserRow | undefined): AdminUser | null {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        username: row.username,
        password: row.password,
        role: row.role,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export async function getSettings(): Promise<SiteSettings> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<SettingsRow[]>("SELECT * FROM settings WHERE id = 1 LIMIT 1");
    return mapSettings(rows[0]);
}

export async function updateSettings(input: Partial<SiteSettings>): Promise<SiteSettings> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const settings = normalizeSiteSettings(input);

    await pool.execute<ResultSetHeader>(
        `UPDATE settings SET
            about_content = ?,
            background_type = ?,
            background_media_url = ?,
            background_media_url_mobile = ?,
            profile_name = ?,
            profile_title = ?,
            profile_image = ?,
            profile_location = ?,
            profile_email = ?,
            github_url = ?,
            linkedin_url = ?,
            instagram_url = ?,
            phone = ?,
            meta_title = ?,
            meta_description = ?,
            meta_keywords = ?,
            quotes = ?,
            updated_at = ?
         WHERE id = 1`,
        [
            settings.aboutContent,
            settings.backgroundType,
            settings.backgroundMediaUrl,
            settings.backgroundMediaUrlMobile || "",
            settings.profileName || "",
            settings.profileTitle || "",
            settings.profileImage || "",
            settings.profileLocation || "",
            settings.profileEmail || "",
            settings.githubUrl || "",
            settings.linkedinUrl || "",
            settings.instagramUrl || "",
            settings.phone || "",
            settings.metaTitle || "",
            settings.metaDescription || "",
            settings.metaKeywords || "",
            stringifyStringArray(settings.quotes),
            new Date().toISOString(),
        ]
    );

    return settings;
}

export async function getPostsPage(page: number, limit: number): Promise<{ posts: Post[]; total: number; page: number }> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const offset = Math.max(0, (page - 1) * limit);

    const [rows] = await pool.execute<PostRow[]>(
        `SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [countRows] = await pool.execute<CountRow[]>("SELECT COUNT(*) AS count FROM posts");

    return {
        posts: rows.map(mapPost),
        total: Number(countRows[0]?.count || 0),
        page,
    };
}

export async function listPosts(): Promise<Post[]> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<PostRow[]>("SELECT * FROM posts ORDER BY created_at DESC");
    return rows.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<PostRow[]>("SELECT * FROM posts WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] ? mapPost(rows[0]) : null;
}

export async function getPostById(id: string): Promise<Post | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<PostRow[]>("SELECT * FROM posts WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? mapPost(rows[0]) : null;
}

export async function createPost(post: Post): Promise<Post> {
    await ensureDatabaseReady();
    const pool = await getPool();

    await pool.execute<ResultSetHeader>(
        `INSERT INTO posts (
            id, title, slug, excerpt, cover_image, content, created_at, updated_at,
            meta_title, meta_description, meta_keywords
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            post.id,
            post.title,
            post.slug,
            post.excerpt || "",
            post.cover_image || "",
            post.content,
            post.created_at,
            post.updated_at,
            post.metaTitle || "",
            post.metaDescription || "",
            post.metaKeywords || "",
        ]
    );

    return post;
}

export async function updatePost(id: string, changes: Partial<Post>): Promise<Post | null> {
    const current = await getPostById(id);
    if (!current) {
        return null;
    }

    const next: Post = {
        ...current,
        title: changes.title || current.title,
        slug: changes.slug || current.slug,
        excerpt: changes.excerpt ?? current.excerpt,
        content: changes.content || current.content,
        cover_image: changes.cover_image ?? current.cover_image,
        metaTitle: changes.metaTitle ?? current.metaTitle ?? "",
        metaDescription: changes.metaDescription ?? current.metaDescription ?? "",
        metaKeywords: changes.metaKeywords ?? current.metaKeywords ?? "",
        updated_at: new Date().toISOString(),
    };

    await ensureDatabaseReady();
    const pool = await getPool();
    await pool.execute<ResultSetHeader>(
        `UPDATE posts SET
            title = ?,
            slug = ?,
            excerpt = ?,
            cover_image = ?,
            content = ?,
            updated_at = ?,
            meta_title = ?,
            meta_description = ?,
            meta_keywords = ?
         WHERE id = ?`,
        [
            next.title,
            next.slug,
            next.excerpt || "",
            next.cover_image || "",
            next.content,
            next.updated_at,
            next.metaTitle || "",
            next.metaDescription || "",
            next.metaKeywords || "",
            id,
        ]
    );

    return next;
}

export async function deletePost(id: string): Promise<boolean> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM posts WHERE id = ?", [id]);
    return result.affectedRows > 0;
}

export async function listProjects(): Promise<Project[]> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<ProjectRow[]>("SELECT * FROM projects ORDER BY created_at DESC");
    return rows.map(mapProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<ProjectRow[]>("SELECT * FROM projects WHERE slug = ? LIMIT 1", [slug]);
    return rows[0] ? mapProject(rows[0]) : null;
}

export async function getProjectById(id: string): Promise<Project | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<ProjectRow[]>("SELECT * FROM projects WHERE id = ? LIMIT 1", [id]);
    return rows[0] ? mapProject(rows[0]) : null;
}

export async function createProject(project: Project): Promise<Project> {
    await ensureDatabaseReady();
    const pool = await getPool();

    await pool.execute<ResultSetHeader>(
        `INSERT INTO projects (
            id, name, slug, description, cover_image, gallery, project_url, github_url,
            root_path, created_at, updated_at, meta_title, meta_description, meta_keywords
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            project.id,
            project.name,
            project.slug,
            project.description || "",
            project.cover_image || "",
            stringifyStringArray(project.gallery),
            project.project_url || "",
            project.github_url || "",
            project.root_path || "",
            project.created_at,
            project.updated_at,
            project.metaTitle || "",
            project.metaDescription || "",
            project.metaKeywords || "",
        ]
    );

    return project;
}

export async function updateProject(id: string, changes: Partial<Project>): Promise<Project | null> {
    const current = await getProjectById(id);
    if (!current) {
        return null;
    }

    const next: Project = {
        ...current,
        name: changes.name || current.name,
        slug: changes.slug || current.slug,
        description: changes.description ?? current.description,
        cover_image: changes.cover_image ?? current.cover_image,
        gallery: Array.isArray(changes.gallery) ? changes.gallery : current.gallery,
        project_url: changes.project_url ?? current.project_url,
        github_url: changes.github_url ?? current.github_url,
        root_path: changes.root_path ?? current.root_path ?? "",
        metaTitle: changes.metaTitle ?? current.metaTitle ?? "",
        metaDescription: changes.metaDescription ?? current.metaDescription ?? "",
        metaKeywords: changes.metaKeywords ?? current.metaKeywords ?? "",
        updated_at: new Date().toISOString(),
    };

    await ensureDatabaseReady();
    const pool = await getPool();

    await pool.execute<ResultSetHeader>(
        `UPDATE projects SET
            name = ?,
            slug = ?,
            description = ?,
            cover_image = ?,
            gallery = ?,
            project_url = ?,
            github_url = ?,
            root_path = ?,
            updated_at = ?,
            meta_title = ?,
            meta_description = ?,
            meta_keywords = ?
         WHERE id = ?`,
        [
            next.name,
            next.slug,
            next.description || "",
            next.cover_image || "",
            stringifyStringArray(next.gallery),
            next.project_url || "",
            next.github_url || "",
            next.root_path || "",
            next.updated_at,
            next.metaTitle || "",
            next.metaDescription || "",
            next.metaKeywords || "",
            id,
        ]
    );

    return next;
}

export async function deleteProject(id: string): Promise<boolean> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [result] = await pool.execute<ResultSetHeader>("DELETE FROM projects WHERE id = ?", [id]);
    return result.affectedRows > 0;
}

export async function listContacts(): Promise<Contact[]> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<ContactRow[]>("SELECT * FROM contacts ORDER BY created_at DESC");
    return rows.map(mapContact);
}

export async function createContact(contact: Contact): Promise<Contact> {
    await ensureDatabaseReady();
    const pool = await getPool();

    await pool.execute<ResultSetHeader>(
        `INSERT INTO contacts (id, name, email, subject, message, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            contact.id,
            contact.name,
            contact.email,
            contact.subject || "",
            contact.message,
            contact.created_at,
        ]
    );

    return contact;
}

export async function findUserByUsername(username: string): Promise<AdminUser | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<AdminUserRow[]>(
        "SELECT * FROM users WHERE username = ? LIMIT 1",
        [username]
    );
    return mapAdminUser(rows[0]);
}

export async function findUserById(id: string): Promise<AdminUser | null> {
    await ensureDatabaseReady();
    const pool = await getPool();
    const [rows] = await pool.execute<AdminUserRow[]>(
        "SELECT * FROM users WHERE id = ? LIMIT 1",
        [id]
    );
    return mapAdminUser(rows[0]);
}

export async function updateUser(id: string, updates: { username?: string; password?: string }): Promise<AdminUser | null> {
    const current = await findUserById(id);
    if (!current) {
        return null;
    }

    const next: AdminUser = {
        ...current,
        username: updates.username || current.username,
        password: updates.password || current.password,
        updated_at: new Date().toISOString(),
    };

    await ensureDatabaseReady();
    const pool = await getPool();
    await pool.execute<ResultSetHeader>(
        `UPDATE users SET username = ?, password = ?, updated_at = ? WHERE id = ?`,
        [next.username, next.password, next.updated_at, id]
    );

    return next;
}
