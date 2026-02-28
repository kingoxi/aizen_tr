import Link from "next/link";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    cover_image: string;
    created_at: string;
}



export default function PostCard({ post }: { post: Post }) {
    const date = new Date(post.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Link href={`/blog/${post.slug}`} className="block group">
            <article
                className="glass-card rounded-xl overflow-hidden h-full flex flex-col"
                style={{ boxShadow: "var(--shadow-card)" }}
            >
                {/* Cover */}
                <div className="w-full h-48 overflow-hidden" style={{ background: "rgba(124,58,237,0.1)" }}>
                    {post.cover_image && !post.cover_image.includes("placeholder") ? (
                        <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(to top, rgba(13,15,26,0.8) 0%, transparent 50%)" }}
                    />
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    <time className="text-xs font-medium mb-2" style={{ color: "#7c3aed" }}>
                        {date}
                    </time>
                    <h2
                        className="text-lg font-bold mb-2 transition-colors duration-200 group-hover:text-purple-400"
                        style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)", lineHeight: 1.3 }}
                    >
                        {post.title}
                    </h2>
                    <p className="text-sm flex-1" style={{ color: "#94a3b8", lineHeight: 1.6 }}>
                        {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold" style={{ color: "#9333ea" }}>
                        Read more
                        <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </article>
        </Link>
    );
}
