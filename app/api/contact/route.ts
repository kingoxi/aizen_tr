import { NextResponse } from "next/server";
import { readJSON, writeJSON } from "@/lib/jsonStore";
import { v4 as uuidv4 } from "uuid";
import type { Contact, ContactFormData } from "@/lib/api";

export async function POST(request: Request) {
    try {
        const body: ContactFormData = await request.json();

        // Honeypot check
        if (body._gotcha) {
            return NextResponse.json({ ok: true, message: "Message sent (ignored)" });
        }

        if (!body.name || !body.email || !body.message) {
            return NextResponse.json(
                { error: "Name, email, and message are required" },
                { status: 400 }
            );
        }

        const contacts = readJSON<Contact[]>("contacts.json");

        const newContact: Contact = {
            id: uuidv4(),
            name: body.name,
            email: body.email,
            subject: body.subject || "",
            message: body.message,
            created_at: new Date().toISOString(),
        };

        contacts.unshift(newContact);
        writeJSON("contacts.json", contacts);

        return NextResponse.json({ ok: true, message: "Message received successfully" });
    } catch (err: unknown) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Invalid request" },
            { status: 400 }
        );
    }
}
