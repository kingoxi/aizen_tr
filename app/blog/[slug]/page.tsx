import { getServerPost } from "@/lib/serverApi";
import Link from "next/link";
import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const resolvedParams = await params;
    const post = await getServerPost(resolvedParams.slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    const title = post.metaTitle || `${post.title} | Blog`;

    const metadata: Metadata = {
        title: title,
    };

    if (post.metaDescription || post.excerpt) {
        metadata.description = post.metaDescription || post.excerpt;
    }

    if (post.metaKeywords) {
        metadata.keywords = post.metaKeywords;
    }

    return metadata;
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const post = await getServerPost(resolvedParams.slug);

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--color-dark-900)" }}>
                <h1 className="text-3xl font-bold mb-4" style={{ color: "#f1f5f9" }}>404</h1>
                <p style={{ color: "#64748b" }}>Post not found</p>
                <Link href="/blog" className="mt-4 btn-neon px-6 py-2 rounded-lg">
                    Back to Blog
                </Link>
            </div>
        );
    }

    return <BlogDetailClient post={post} />;
}
