import bcrypt from "bcryptjs";
import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import type { Contact, Post, Project, SiteSettings } from "./api";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "./defaults";
import { readJSON } from "./jsonStore";

type LegacyUser = {
    id: string;
    username: string;
    password: string;
    role?: string;
    created_at?: string;
    updated_at?: string;
};

type CountRow = RowDataPacket & { count: number };

type DbConfig = {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
};

declare global {
    var __aizenDbPool: Pool | undefined;
    var __aizenDbInitPromise: Promise<Pool> | undefined;
}

function getRequiredValue(name: string, ...fallbacks: Array<string | undefined>): string {
    const value = [process.env[name], ...fallbacks].find(
        (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0
    );

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
}

function getDbConfig(): DbConfig {
    return {
        host: getRequiredValue("DB_HOST"),
        user: getRequiredValue("DB_USER", process.env.DB_USERNAME),
        password: process.env.DB_PASS || process.env.DB_PASSWORD || "",
        database: getRequiredValue("DB_NAME"),
        port: Number(process.env.DB_PORT || 3306),
    };
}

function escapeIdentifier(value: string): string {
    return `\`${value.replace(/`/g, "``")}\``;
}

function serializeArray(items: string[] | undefined): string {
    return JSON.stringify(Array.isArray(items) ? items : []);
}

function readLegacySettings(): SiteSettings {
    const legacySettings = readJSON<Partial<SiteSettings> | SiteSettings[]>("settings.json");
    if (Array.isArray(legacySettings)) {
        return DEFAULT_SITE_SETTINGS;
    }

    return normalizeSiteSettings(legacySettings);
}

async function createDatabaseIfNeeded(config: DbConfig): Promise<void> {
    const existingDatabasePool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
        waitForConnections: true,
        connectionLimit: 1,
        queueLimit: 0,
    });

    try {
        await existingDatabasePool.query("SELECT 1");
        return;
    } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? error.code : undefined;
        if (code !== "ER_BAD_DB_ERROR") {
            throw error;
        }
    } finally {
        await existingDatabasePool.end();
    }

    const pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port,
        waitForConnections: true,
        connectionLimit: 2,
        queueLimit: 0,
    });

    try {
        await pool.query(
            `CREATE DATABASE IF NOT EXISTS ${escapeIdentifier(config.database)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
    } finally {
        await pool.end();
    }
}

async function isTableEmpty(connection: PoolConnection, tableName: string): Promise<boolean> {
    const [rows] = await connection.query<CountRow[]>(
        `SELECT COUNT(*) AS count FROM ${escapeIdentifier(tableName)}`
    );

    return Number(rows[0]?.count || 0) === 0;
}

async function ensureSchema(pool: Pool): Promise<void> {
    const statements = [
        `CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(64) PRIMARY KEY,
            username VARCHAR(191) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'admin',
            created_at VARCHAR(40) NOT NULL,
            updated_at VARCHAR(40) NOT NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS posts (
            id VARCHAR(64) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(191) NOT NULL UNIQUE,
            excerpt TEXT NOT NULL,
            cover_image TEXT NOT NULL,
            content LONGTEXT NOT NULL,
            created_at VARCHAR(40) NOT NULL,
            updated_at VARCHAR(40) NOT NULL,
            meta_title VARCHAR(255) NOT NULL DEFAULT '',
            meta_description TEXT NOT NULL,
            meta_keywords TEXT NOT NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS projects (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(191) NOT NULL UNIQUE,
            description LONGTEXT NOT NULL,
            cover_image TEXT NOT NULL,
            gallery LONGTEXT NOT NULL,
            project_url TEXT NOT NULL,
            github_url TEXT NOT NULL,
            root_path TEXT NOT NULL,
            created_at VARCHAR(40) NOT NULL,
            updated_at VARCHAR(40) NOT NULL,
            meta_title VARCHAR(255) NOT NULL DEFAULT '',
            meta_description TEXT NOT NULL,
            meta_keywords TEXT NOT NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS contacts (
            id VARCHAR(64) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message LONGTEXT NOT NULL,
            created_at VARCHAR(40) NOT NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
        `CREATE TABLE IF NOT EXISTS settings (
            id TINYINT PRIMARY KEY,
            about_content LONGTEXT NOT NULL,
            background_type VARCHAR(50) NOT NULL,
            background_media_url TEXT NOT NULL,
            background_media_url_mobile TEXT NOT NULL,
            profile_name VARCHAR(255) NOT NULL,
            profile_title VARCHAR(255) NOT NULL,
            profile_image TEXT NOT NULL,
            profile_location VARCHAR(255) NOT NULL,
            profile_email VARCHAR(255) NOT NULL,
            github_url TEXT NOT NULL,
            linkedin_url TEXT NOT NULL,
            instagram_url TEXT NOT NULL,
            phone VARCHAR(255) NOT NULL,
            meta_title VARCHAR(255) NOT NULL,
            meta_description TEXT NOT NULL,
            meta_keywords TEXT NOT NULL,
            quotes LONGTEXT NOT NULL,
            updated_at VARCHAR(40) NOT NULL
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    ];

    for (const statement of statements) {
        await pool.query(statement);
    }
}

async function seedUsers(connection: PoolConnection): Promise<void> {
    if (!(await isTableEmpty(connection, "users"))) {
        return;
    }

    const users = readJSON<LegacyUser[]>("users.json");
    const bootstrapUsername = process.env.ADMIN_USERNAME || "admin";
    const bootstrapPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12);
    const now = new Date().toISOString();

    if (Array.isArray(users) && users.length > 0) {
        for (const user of users) {
            const createdAt = user.created_at || new Date().toISOString();
            const updatedAt = user.updated_at || createdAt;

            await connection.execute<ResultSetHeader>(
                `INSERT INTO users (id, username, password, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    user.id || uuidv4(),
                    user.username,
                    user.password,
                    user.role || "admin",
                    createdAt,
                    updatedAt,
                ]
            );
        }

        await connection.execute<ResultSetHeader>(
            `INSERT INTO users (id, username, password, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                password = VALUES(password),
                role = VALUES(role),
                updated_at = VALUES(updated_at)`,
            [
                uuidv4(),
                bootstrapUsername,
                bootstrapPasswordHash,
                "admin",
                now,
                now,
            ]
        );
        return;
    }

    await connection.execute<ResultSetHeader>(
        `INSERT INTO users (id, username, password, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
            uuidv4(),
            bootstrapUsername,
            bootstrapPasswordHash,
            "admin",
            now,
            now,
        ]
    );
}

async function seedPosts(connection: PoolConnection): Promise<void> {
    if (!(await isTableEmpty(connection, "posts"))) {
        return;
    }

    const posts = readJSON<Post[]>("posts.json");
    if (!Array.isArray(posts) || posts.length === 0) {
        return;
    }

    for (const post of posts) {
        await connection.execute<ResultSetHeader>(
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
    }
}

async function seedProjects(connection: PoolConnection): Promise<void> {
    if (!(await isTableEmpty(connection, "projects"))) {
        return;
    }

    const projects = readJSON<Array<Project & { root_path?: string }>>("projects.json");
    if (!Array.isArray(projects) || projects.length === 0) {
        return;
    }

    for (const project of projects) {
        await connection.execute<ResultSetHeader>(
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
                serializeArray(project.gallery),
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
    }
}

async function seedContacts(connection: PoolConnection): Promise<void> {
    if (!(await isTableEmpty(connection, "contacts"))) {
        return;
    }

    const contacts = readJSON<Contact[]>("contacts.json");
    if (!Array.isArray(contacts) || contacts.length === 0) {
        return;
    }

    for (const contact of contacts) {
        await connection.execute<ResultSetHeader>(
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
    }
}

async function seedSettings(connection: PoolConnection): Promise<void> {
    if (!(await isTableEmpty(connection, "settings"))) {
        return;
    }

    const settings = readLegacySettings();

    await connection.execute<ResultSetHeader>(
        `INSERT INTO settings (
            id, about_content, background_type, background_media_url, background_media_url_mobile,
            profile_name, profile_title, profile_image, profile_location, profile_email,
            github_url, linkedin_url, instagram_url, phone, meta_title, meta_description,
            meta_keywords, quotes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            1,
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
            serializeArray(settings.quotes),
            new Date().toISOString(),
        ]
    );
}

async function migrateLegacyData(pool: Pool): Promise<void> {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        await seedUsers(connection);
        await seedPosts(connection);
        await seedProjects(connection);
        await seedContacts(connection);
        await seedSettings(connection);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function initializePool(): Promise<Pool> {
    const config = getDbConfig();

    await createDatabaseIfNeeded(config);

    const pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        charset: "utf8mb4",
    });

    await ensureSchema(pool);
    await migrateLegacyData(pool);

    return pool;
}

export async function getPool(): Promise<Pool> {
    if (globalThis.__aizenDbPool) {
        return globalThis.__aizenDbPool;
    }

    if (!globalThis.__aizenDbInitPromise) {
        globalThis.__aizenDbInitPromise = initializePool()
            .then((pool) => {
                globalThis.__aizenDbPool = pool;
                return pool;
            })
            .catch((error) => {
                globalThis.__aizenDbInitPromise = undefined;
                throw error;
            });
    }

    return globalThis.__aizenDbInitPromise;
}

export async function ensureDatabaseReady(): Promise<void> {
    await getPool();
}
