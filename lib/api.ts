export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(error.error || "Request failed");
    }
    return res.json();
}

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

export async function getPosts(page = 1, limit = 12) {
    return apiFetch<{ posts: Post[]; total: number; page: number }>(
        `/api/posts?page=${page}&limit=${limit}`
    );
}

export async function getPost(slug: string) {
    return apiFetch<Post>(`/api/posts/${slug}`);
}

export async function getProjects() {
    return apiFetch<Project[]>(`/api/projects`);
}

export async function getProject(slug: string) {
    return apiFetch<Project>(`/api/projects/${slug}`);
}

export async function submitContact(data: ContactFormData) {
    return apiFetch<{ ok: boolean; message: string }>(`/api/contact`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getSettings() {
    return apiFetch<SiteSettings>(`/api/settings`);
}

// ─── ADMIN ──────────────────────────────────────────────────────────────────

export async function adminLogin(username: string, password: string) {
    return apiFetch<{ ok: boolean; username: string }>(`/api/admin/login`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export async function adminLogout() {
    return apiFetch<{ ok: boolean }>(`/api/admin/logout`, { method: "POST" });
}

export async function adminGetMe() {
    return apiFetch<{ username: string }>(`/api/admin/me`);
}

export async function adminGetPosts() {
    return apiFetch<Post[]>(`/api/admin/posts`);
}

export async function adminCreatePost(data: Partial<Post>) {
    return apiFetch<Post>(`/api/admin/posts`, { method: "POST", body: JSON.stringify(data) });
}

export async function adminUpdatePost(id: string, data: Partial<Post>) {
    return apiFetch<Post>(`/api/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function adminDeletePost(id: string) {
    return apiFetch<{ ok: boolean }>(`/api/admin/posts/${id}`, { method: "DELETE" });
}

export async function adminGetProjects() {
    return apiFetch<Project[]>(`/api/admin/projects`);
}

export async function adminCreateProject(data: Partial<Project>) {
    return apiFetch<Project>(`/api/admin/projects`, { method: "POST", body: JSON.stringify(data) });
}

export async function adminUpdateProject(id: string, data: Partial<Project>) {
    return apiFetch<Project>(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function adminDeleteProject(id: string) {
    return apiFetch<{ ok: boolean }>(`/api/admin/projects/${id}`, { method: "DELETE" });
}

export async function adminGetContacts() {
    return apiFetch<Contact[]>(`/api/admin/contacts`);
}

export async function adminUpload(file: File, type: "posts" | "projects", slug: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", slug);
    const res = await fetch(`/api/admin/upload?type=${type}`, {
        method: "POST",
        body: formData,
        credentials: "include",
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(error.error);
    }
    return res.json() as Promise<{ ok: boolean; url: string }>;
}

export async function adminGetSettings() {
    return apiFetch<SiteSettings>(`/api/admin/settings`);
}

export async function adminUpdateSettings(data: Partial<SiteSettings>) {
    return apiFetch<SiteSettings>(`/api/admin/settings`, { method: "PUT", body: JSON.stringify(data) });
}

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    content: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    gallery: string[];
    project_url: string;
    github_url: string;
    created_at: string;
    updated_at: string;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
}

export interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    _gotcha?: string;
}

export interface SiteSettings {
    aboutContent: string;
    backgroundType: "dynamic" | "video" | "none";
    backgroundMediaUrl: string;
    profileName?: string;
    profileTitle?: string;
    profileImage?: string;
    profileLocation?: string;
    profileEmail?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    phone?: string;
}
