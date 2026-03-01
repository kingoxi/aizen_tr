"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminGetSettings, adminUpdateSettings, adminUpload, type SiteSettings } from "@/lib/api";

export default function SettingsPage() {
    const router = useRouter();
    const [settings, setSettings] = useState<SiteSettings>({
        aboutContent: "",
        backgroundType: "dynamic",
        backgroundMediaUrl: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        adminGetSettings()
            .then((data) => {
                setSettings(data);
            })
            .catch(() => router.push("/admin/login"))
            .finally(() => setLoading(false));
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleQuoteChange = (index: number, value: string) => {
        const newQuotes = [...(settings.quotes || [])];
        newQuotes[index] = value;
        setSettings(prev => ({ ...prev, quotes: newQuotes }));
    };

    const addQuote = () => {
        setSettings(prev => ({ ...prev, quotes: [...(prev.quotes || []), ""] }));
    };

    const removeQuote = (index: number) => {
        const newQuotes = (settings.quotes || []).filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, quotes: newQuotes }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        try {
            const res = await adminUpload(file, "projects", "main-page");
            setSettings(prev => ({ ...prev, profileImage: res.url }));
            setMessage("Image uploaded! Don't forget to save settings.");
        } catch (error: any) {
            setMessage(error.message || "Upload failed");
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage("");
        try {
            await adminUpdateSettings(settings);
            setMessage("Settings saved successfully!");
        } catch (error: any) {
            setMessage(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(""), 4000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-10" style={{ background: "var(--color-dark-900)" }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/dashboard" className="text-sm mb-1 flex items-center gap-1" style={{ color: "#64748b" }}>
                            ← Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            Site Settings
                        </h1>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="btn-neon px-6 py-2.5 rounded-lg text-sm disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl mb-6 text-sm border ${message.includes("success") ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {message}
                    </div>
                )}

                <div className="space-y-6">
                    {/* Identity Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">👤</span> Identity
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Profile Image</label>
                                <div className="relative group w-full aspect-square bg-black/20 rounded-xl overflow-hidden border border-white/10">
                                    {settings.profileImage ? (
                                        <img src={settings.profileImage} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <span className="text-xs font-bold text-white">Upload New</span>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</label>
                                        <input type="text" name="profileName" value={settings.profileName || ""} onChange={handleChange} className="neon-input text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Title</label>
                                        <input type="text" name="profileTitle" value={settings.profileTitle || ""} onChange={handleChange} className="neon-input text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Location</label>
                                    <input type="text" name="profileLocation" value={settings.profileLocation || ""} onChange={handleChange} className="neon-input text-sm" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email</label>
                                        <input type="email" name="profileEmail" value={settings.profileEmail || ""} onChange={handleChange} className="neon-input text-sm" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Phone</label>
                                        <input type="text" name="phone" value={settings.phone || ""} onChange={handleChange} className="neon-input text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Appearance Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">🎨</span> Visuals
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Background Style</label>
                                <select name="backgroundType" value={settings.backgroundType} onChange={handleChange} className="neon-input text-sm bg-transparent">
                                    <option value="dynamic">✨ Dynamic Particles</option>
                                    <option value="video">🎥 Video Background</option>
                                    <option value="none">🌑 Minimal Dark</option>
                                </select>
                            </div>
                        </div>
                        {settings.backgroundType === "video" && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Desktop Video URL</label>
                                    <input type="text" name="backgroundMediaUrl" value={settings.backgroundMediaUrl || ""} onChange={handleChange} className="neon-input text-sm font-mono" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mobile Video URL</label>
                                    <input type="text" name="backgroundMediaUrlMobile" value={settings.backgroundMediaUrlMobile || ""} onChange={handleChange} className="neon-input text-sm font-mono" />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Aizen Quotes Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">💬</span> Aizen Quotes
                        </h2>
                        <div className="space-y-3">
                            {(settings.quotes || []).map((quote, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={quote}
                                        onChange={(e) => handleQuoteChange(idx, e.target.value)}
                                        className="neon-input text-sm flex-1"
                                        placeholder={`Quote #${idx + 1}`}
                                    />
                                    <button
                                        onClick={() => removeQuote(idx)}
                                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors border border-red-500/20"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addQuote}
                                className="w-full py-3 rounded-xl border border-dashed border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest hover:border-purple-500/60 hover:bg-purple-500/5 transition-all mt-2"
                            >
                                + Add New Quote
                            </button>
                        </div>
                    </section>

                    {/* SEO Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">🚀</span> SEO
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Master Title Tag</label>
                                    <span className="text-[10px] text-gray-600">[{settings.metaTitle?.length || 0}/60]</span>
                                </div>
                                <input type="text" name="metaTitle" value={settings.metaTitle || ""} onChange={handleChange} className="neon-input text-sm" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Master Description</label>
                                    <span className="text-[10px] text-gray-600">[{settings.metaDescription?.length || 0}/160]</span>
                                </div>
                                <textarea name="metaDescription" value={settings.metaDescription || ""} onChange={handleChange} className="neon-input text-sm min-h-[80px]" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Global Keywords (CSV)</label>
                                <input type="text" name="metaKeywords" value={settings.metaKeywords || ""} onChange={handleChange} className="neon-input text-sm" placeholder="dev, portfolio, aizen" />
                            </div>
                        </div>
                    </section>

                    {/* Social Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">🌐</span> Network
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">GitHub URL</label>
                                <input type="text" name="githubUrl" value={settings.githubUrl || ""} onChange={handleChange} className="neon-input text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">LinkedIn URL</label>
                                <input type="text" name="linkedinUrl" value={settings.linkedinUrl || ""} onChange={handleChange} className="neon-input text-sm" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Instagram URL</label>
                                <input type="text" name="instagramUrl" value={settings.instagramUrl || ""} onChange={handleChange} className="neon-input text-sm" />
                            </div>
                        </div>
                    </section>

                    {/* BIO Section */}
                    <section className="glass-card rounded-2xl p-6 border border-white/5">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                            <span className="text-purple-500 text-xl">📝</span> Biography
                        </h2>
                        <textarea
                            name="aboutContent"
                            value={settings.aboutContent}
                            onChange={handleChange}
                            className="neon-input text-sm min-h-[300px] font-mono leading-relaxed p-6"
                            placeholder="# About Me..."
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
