import ContactClient from "./ContactClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
    description: "Get in touch with Hamza for collaborations, inquiries, or just to say hello.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen px-4 py-16" style={{ background: "var(--color-dark-900)" }}>
            <ContactClient />
        </div>
    );
}
