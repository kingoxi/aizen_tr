CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at VARCHAR(40) NOT NULL,
    updated_at VARCHAR(40) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS posts (
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message LONGTEXT NOT NULL,
    created_at VARCHAR(40) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
