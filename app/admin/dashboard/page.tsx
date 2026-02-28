"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    adminGetMe,
    adminGetPosts,
    adminGetProjects,
    adminGetContacts,
    adminLogout,
    type Post,
    type Project,
    type Contact,
} from "@/lib/api";

export default function DashboardPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminGetMe()
            .then((me) => {
                setUsername(me.username);
                return Promise.all([adminGetPosts(), adminGetProjects(), adminGetContacts()]);
            })
            .then(([p, pr, c]) => {
                setPosts(p);
                setProjects(pr);
                setContacts(c);
            })
            .catch(() => router.push("/admin/login"))
            .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = async () => {
        await adminLogout();
        router.push("/admin/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: "Posts", value: posts.length, color: "#9333ea", icon: "📝", href: "/admin/posts" },
        { label: "Projects", value: projects.length, color: "#06b6d4", icon: "🚀", href: "/admin/projects" },
        { label: "Messages", value: contacts.length, color: "#3b82f6", icon: "📨", href: "/admin/contacts" },
    ];


    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <p className="text-sm" style={{ color: "#64748b" }}>Welcome back,</p>
                        <h1
                            className="text-2xl font-bold"
                            style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}
                        >
                            {username}
                        </h1>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ border: "1px solid rgba(239,68,68,0.4)", color: "#f87171", background: "rgba(239,68,68,0.05)" }}
                    >
                        Logout
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-8">
                    {[
                        { href: "/admin/posts", label: "📝 Manage Posts" },
                        { href: "/admin/projects", label: "🚀 Manage Projects" },
                        { href: "/admin/contacts", label: "📨 Messages" },
                        { href: "/admin/settings", label: "⚙️ Site Settings" },
                        { href: "/admin/profile", label: "👤 Account Profile" },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-4 py-2 rounded-lg text-sm font-medium neon-border"
                            style={{ color: "#a78bfa", background: "rgba(124,58,237,0.08)" }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                    {stats.map((s) => (
                        <Link key={s.label} href={s.href} className="glass-card rounded-xl p-6 block">
                            <div className="text-3xl mb-2">{s.icon}</div>
                            <p className="text-3xl font-black" style={{ color: s.color, fontFamily: "var(--font-orbitron)" }}>
                                {s.value}
                            </p>
                            <p className="text-sm mt-1" style={{ color: "#64748b" }}>{s.label}</p>
                        </Link>
                    ))}
                </div>

                {/* Recent data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Posts */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold" style={{ color: "#f1f5f9" }}>Recent Posts</h2>
                            <Link href="/admin/posts" className="text-sm" style={{ color: "#9333ea" }}>See all →</Link>
                        </div>
                        <div className="space-y-3">
                            {posts.slice(0, 5).map((p) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <span className="text-sm truncate flex-1" style={{ color: "#94a3b8" }}>{p.title}</span>
                                    <span className="text-xs ml-2 shrink-0" style={{ color: "#64748b" }}>
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {posts.length === 0 && <p className="text-sm" style={{ color: "#475569" }}>No posts yet</p>}
                        </div>
                    </div>

                    {/* Recent Contacts */}
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold" style={{ color: "#f1f5f9" }}>Recent Messages</h2>
                            <Link href="/admin/contacts" className="text-sm" style={{ color: "#3b82f6" }}>See all →</Link>
                        </div>
                        <div className="space-y-3">
                            {contacts.slice(0, 5).map((c) => (
                                <div key={c.id} className="flex items-center justify-between">
                                    <span className="text-sm truncate flex-1" style={{ color: "#94a3b8" }}>{c.name} — {c.subject}</span>
                                    <span className="text-xs ml-2 shrink-0" style={{ color: "#64748b" }}>
                                        {new Date(c.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                            {contacts.length === 0 && <p className="text-sm" style={{ color: "#475569" }}>No messages yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
