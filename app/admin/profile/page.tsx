"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        currentPassword: "",
        newUsername: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            setMessage({ text: "New passwords do not match", type: "error" });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newUsername: form.newUsername || undefined,
                    newPassword: form.newPassword || undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            setMessage({ text: "Profile updated successfully! Please log in again if you changed your credentials.", type: "success" });
            setForm({ currentPassword: "", newUsername: "", newPassword: "", confirmPassword: "" });

            // If they changed username/password, they might need to relog
            if (form.newUsername || form.newPassword) {
                setTimeout(() => router.push("/admin/login"), 2000);
            }
        } catch (error: any) {
            setMessage({ text: error.message, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <Link href="/admin/dashboard" className="text-sm mb-4 inline-flex items-center gap-1 text-gray-500 hover:text-purple-400 transition-colors">
                ← Back to Dashboard
            </Link>
            <div className="glass-card rounded-xl p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}>
                    Account Management
                </h1>

                {message.text && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === "success" ? "neon-border" : "border-red-500/50 text-red-400 bg-red-500/10"}`}
                        style={message.type === "success" ? { color: "#a78bfa", background: "rgba(124,58,237,0.08)" } : {}}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-400">Current Password (Required to save changes)</label>
                        <input
                            type="password"
                            name="currentPassword"
                            required
                            value={form.currentPassword}
                            onChange={handleChange}
                            className="neon-input"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="pt-6 border-t border-purple-500/10 space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-400">New Username (Optional)</label>
                            <input
                                type="text"
                                name="newUsername"
                                value={form.newUsername}
                                onChange={handleChange}
                                className="neon-input"
                                placeholder="Leave blank to keep current"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-400">New Password (Optional)</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="neon-input"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-400">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="neon-input"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-neon w-full py-3 rounded-xl font-bold transition-all disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Credentials"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
