import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { authMiddleware, getAdminUser } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const authError = await authMiddleware(request);
    if (authError) return authError;

    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { currentPassword, newUsername, newPassword } = await request.json();

        if (!currentPassword) {
            return NextResponse.json({ error: "Current password is required" }, { status: 400 });
        }

        const users = readJSON<any[]>("users.json");
        const userIdx = users.findIndex((u) => u.id === admin.id);

        if (userIdx === -1) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = users[userIdx];

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Update fields
        if (newUsername) {
            // Check if username already exists (excluding self)
            const exists = users.find(u => u.username === newUsername && u.id !== admin.id);
            if (exists) {
                return NextResponse.json({ error: "Username already taken" }, { status: 400 });
            }
            user.username = newUsername;
        }

        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, 12);
        }

        users[userIdx] = user;
        writeJSON("users.json", users);

        return NextResponse.json({ ok: true, message: "Profile updated successfully" });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
    }
}
