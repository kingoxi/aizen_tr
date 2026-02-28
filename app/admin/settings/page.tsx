"use client";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
            setTimeout(() => setMessage(""), 3000);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="glass-card rounded-xl p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}>
                    Site Settings
                </h1>

                {message && (
                    <div
                        className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.toLowerCase().includes("success") || message.toLowerCase().includes("upload") ? "neon-border" : "border-red-500/50 text-red-400 bg-red-500/10"}`}
                        style={message.toLowerCase().includes("success") || message.toLowerCase().includes("upload") ? { color: "#a78bfa", background: "rgba(124,58,237,0.08)" } : {}}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* ─── Profile Section ─── */}
                    <div className="pt-4 border-t border-purple-500/10">
                        <h2 className="text-lg font-bold mb-4 text-purple-400">Profile Information</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium mb-2 text-gray-400">Profile Image</label>
                                <div className="relative group w-full aspect-square bg-black/40 rounded-xl overflow-hidden border border-purple-500/20 mb-2">
                                    {settings.profileImage ? (
                                        <img src={settings.profileImage} alt="profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600">No Image</div>
                                    )}
                                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                        <span className="text-xs font-bold text-white">CHANGE</span>
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Display Name</label>
                                    <input type="text" name="profileName" value={settings.profileName || ""} onChange={handleChange} className="neon-input" placeholder="Hamza (Aizen)" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Professional Title</label>
                                    <input type="text" name="profileTitle" value={settings.profileTitle || ""} onChange={handleChange} className="neon-input" placeholder="Full-stack Developer" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-400">Email Address</label>
                                    <input type="email" name="profileEmail" value={settings.profileEmail || ""} onChange={handleChange} className="neon-input" placeholder="hamza@aizen.tr" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Location</label>
                                <input type="text" name="profileLocation" value={settings.profileLocation || ""} onChange={handleChange} className="neon-input" placeholder="Soul Society" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Phone</label>
                                <input type="text" name="phone" value={settings.phone || ""} onChange={handleChange} className="neon-input" placeholder="+90 5XX XXX XX XX" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">GitHub URL</label>
                                <input type="text" name="githubUrl" value={settings.githubUrl || ""} onChange={handleChange} className="neon-input" placeholder="https://github.com/..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">LinkedIn URL</label>
                                <input type="text" name="linkedinUrl" value={settings.linkedinUrl || ""} onChange={handleChange} className="neon-input" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-400">Instagram URL</label>
                                <input type="text" name="instagramUrl" value={settings.instagramUrl || ""} onChange={handleChange} className="neon-input" placeholder="https://instagram.com/..." />
                            </div>
                        </div>
                    </div>

                    {/* ─── Content Section ─── */}
                    <div className="pt-4 border-t border-purple-500/10">
                        <label className="block text-sm font-medium mb-2 text-purple-400">About Biography (Markdown)</label>
                        <textarea
                            name="aboutContent"
                            value={settings.aboutContent}
                            onChange={handleChange}
                            className="w-full bg-black/50 border rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                            style={{ borderColor: "rgba(147, 51, 234, 0.3)" }}
                            rows={12}
                            placeholder="# Heading&#10;&#10;Write about yourself here..."
                        />
                    </div>

                    {/* ─── Background Section ─── */}
                    <div className="pt-4 border-t border-purple-500/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-400">Homepage Background Type</label>
                                <select
                                    name="backgroundType"
                                    value={settings.backgroundType}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 appearance-none"
                                    style={{ borderColor: "rgba(147, 51, 234, 0.3)" }}
                                >
                                    <option value="dynamic">Interactive Dynamic Gradient</option>
                                    <option value="video">Custom Video / GIF</option>
                                    <option value="none">Flat Dark Theme</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-purple-400">Background Video/GIF URL</label>
                                <input
                                    type="text"
                                    name="backgroundMediaUrl"
                                    value={settings.backgroundMediaUrl || ""}
                                    onChange={handleChange}
                                    disabled={settings.backgroundType !== "video"}
                                    className="w-full bg-black/50 border rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
                                    style={{ borderColor: "rgba(147, 51, 234, 0.3)" }}
                                    placeholder="/uploads/video/bg.mp4"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-purple-500/20">
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn-neon px-12 py-3 rounded-xl font-bold shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 w-full md:w-auto"
                        >
                            {saving ? "Saving..." : "Save All Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
