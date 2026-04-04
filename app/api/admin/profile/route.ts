import { NextResponse } from "next/server";
import { findUserById, findUserByUsername, updateUser } from "@/lib/store";
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

        const user = await findUserById(admin.id);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        let nextUsername = user.username;
        let nextPassword = user.password;

        if (newUsername) {
            const existingUser = await findUserByUsername(newUsername);
            if (existingUser && existingUser.id !== admin.id) {
                return NextResponse.json({ error: "Username already taken" }, { status: 400 });
            }
            nextUsername = newUsername;
        }

        if (newPassword) {
            nextPassword = await bcrypt.hash(newPassword, 12);
        }

        await updateUser(admin.id, {
            username: nextUsername,
            password: nextPassword,
        });

        return NextResponse.json({ ok: true, message: "Profile updated successfully" });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to update profile" },
            { status: 500 }
        );
    }
}
