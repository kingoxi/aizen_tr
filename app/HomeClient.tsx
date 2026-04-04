"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import ProjectCard from "@/components/ProjectCard";
import type { Post, Project, SiteSettings } from "@/lib/api";

const DEFAULT_QUOTES = [
  "He is behind to everything",
  "Yare Yare.",
  "Always but soon",
  "Yokoso, watashi no soul society",
  "Always",
  "So Right",
  "Aizen.tr"
];

function createInitialShards() {
  return Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 40 + 20}px`,
    delay: `${Math.random() * 5}s`,
    duration: `${Math.random() * 10 + 10}s`,
  }));
}

export default function HomeClient(props: {
  initialPosts: Post[];
  initialProjects: Project[];
  initialSettings: SiteSettings | null;
}) {
  const [posts] = useState<Post[]>(props.initialPosts);
  const [projects] = useState<Project[]>(props.initialProjects);
  const [settings] = useState<SiteSettings | null>(props.initialSettings);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [shards] = useState(createInitialShards);

  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (videoRef.current) videoRef.current.pause();
        document.title = "Zzz... Aizen.tr is sleeping";
      } else {
        if (videoRef.current) videoRef.current.play().catch(() => { });
        document.title = "Aizen.tr — Soul Society";
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const quotes = settings?.quotes?.length ? settings.quotes : DEFAULT_QUOTES;
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(quoteInterval);
  }, [settings?.quotes]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (isMobile) return;
    if (settings?.backgroundType === "dynamic") {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    }
  };

  const currentQuotes = settings?.quotes?.length ? settings.quotes : DEFAULT_QUOTES;

  return (
    <div>
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden transition-all duration-700"
        style={{
          background: settings?.backgroundType === "dynamic" && !isMobile
            ? `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(147, 51, 234, 0.2) 0%, var(--color-dark-900) 60%)`
            : "var(--color-dark-900)"
        }}
        onMouseMove={handleMouseMove}
      >
        {!isMobile && shards.map((shard) => (
          <div
            key={shard.id}
            className="fragment-shard animate-reiatsu"
            style={{
              top: shard.top,
              left: shard.left,
              width: shard.size,
              height: shard.size,
              animationDelay: shard.delay,
              animationDuration: shard.duration,
              opacity: 0.1
            }}
          />
        ))}

        {settings?.backgroundType === "video" && (settings.backgroundMediaUrl || settings.backgroundMediaUrlMobile) && (
          <>
            <video
              key={isMobile && settings.backgroundMediaUrlMobile ? "mobile" : "desktop"}
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
            >
              <source
                src={(isMobile && settings.backgroundMediaUrlMobile) ? settings.backgroundMediaUrlMobile : settings.backgroundMediaUrl}
                type="video/mp4"
              />
            </video>
            <div className="absolute bottom-30 right-10 z-30">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-purple-500/30 text-white text-xs font-bold hover:bg-purple-500/20 transition-all animate-reiatsu"
              >
                {isMuted ? (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" /></svg>
                    UNMUTE VIDEO
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.414 4.243 1 1 0 01-1.414-1.414A3.987 3.987 0 0013 10c0-1.105-.447-2.103-1.172-2.828a1 1 0 010-1.414z" /></svg>
                    MUTE VIDEO
                  </>
                )}
              </button>
            </div>
          </>
        )}

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
          }}
        />

        <div className="relative z-10 text-center px-4 py-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-reiatsu"
            style={{
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.4)",
              color: "#a78bfa",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            Soul Reaper&apos;s Digital Realm
          </div>

          <h1
            className="text-6xl sm:text-8xl font-black mb-6 leading-tight select-none"
            style={{ fontFamily: "var(--font-orbitron)" }}
          >
            <span
              className="glitch-hover inline-block"
              style={{
                background: "linear-gradient(135deg, #9333ea 0%, #3b82f6 50%, #06b6d4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Aizen.tr
            </span>
          </h1>

          <div className="min-h-[200px] flex items-center justify-center mb-10 overflow-hidden">
            <p
              key={quoteIndex}
              className="text-xl sm:text-2xl italic font-light max-w-2xl mx-auto leading-relaxed reveal"
              style={{ color: "#cbd5e1", animation: "shatter 1s forwards" }}
            >
              &ldquo;{currentQuotes[quoteIndex] || DEFAULT_QUOTES[0]}&rdquo;
            </p>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/projects" className="btn-neon px-8 py-3 rounded-lg text-base animate-reiatsu">
              View Projects
            </Link>
            <Link
              href="/blog"
              className="px-8 py-3 rounded-lg text-base font-semibold transition-all duration-300 glass-card"
              style={{
                color: "#9333ea",
                border: "1px solid rgba(147,51,234,0.5)",
              }}
            >
              Read Blog
            </Link>
          </div>

          <div onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })} className="mt-20 flex flex-col items-center gap-2 opacity-50 cursor-pointer hover:opacity-100 transition-opacity">
            <span className="text-xs" style={{ color: "#94a3b8" }}>Scroll to explore</span>
            <div className="w-5 h-8 rounded-full border-2 border-purple-500/40 flex justify-center pt-1.5 animate-reiatsu">
              <div className="w-1.5 h-2 rounded-full bg-purple-500 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden" style={{ background: "var(--color-dark-900)" }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative group reveal">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass-card rounded-3xl overflow-hidden border border-white/10 aspect-square">
              <img
                src={settings?.profileImage || "/uploads/main-page/avatar.jpg"}
                alt={settings?.profileName || "Hamza"}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
              />
            </div>
          </div>
          <div className="space-y-8 reveal">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#9333ea" }}>
                Overview
              </p>
              <h2 className="text-4xl font-black mb-4" style={{ fontFamily: "var(--font-orbitron)", color: "#f1f5f9" }}>
                The Architect: <span className="text-purple-500">{settings?.profileName || "Hamza"}</span>
              </h2>
              <p className="text-xl font-medium" style={{ color: "#a78bfa" }}>
                {settings?.profileTitle || "Full-stack Developer"}
              </p>
            </div>
            <div className="prose prose-invert max-w-none text-gray-400 leading-loose">
              <p className="line-clamp-6">
                {settings?.aboutContent?.replace(/[#*`]/g, "").slice(0, 500)}...
              </p>
            </div>
            <Link href="/about" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-purple-400 hover:text-purple-300 transition-colors group">
              Learn full history
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "var(--color-dark-800)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>
                Latest
              </p>
              <h2 className="text-3xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                From the Blog
              </h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold transition-colors" style={{ color: "#9333ea" }}>
              All posts →
            </Link>
          </div>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-xl" style={{ color: "#64748b" }}>
              <p>No posts yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "var(--color-dark-900)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#06b6d4" }}>
                Portfolio
              </p>
              <h2 className="text-3xl font-bold" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
                Featured Projects
              </h2>
            </div>
            <Link href="/projects" className="text-sm font-semibold" style={{ color: "#06b6d4" }}>
              All projects →
            </Link>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 glass-card rounded-xl" style={{ color: "#64748b" }}>
              <p>No projects yet. Stay tuned.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 px-4" style={{ background: "var(--color-dark-800)" }}>
        <div
          className="max-w-3xl mx-auto text-center rounded-2xl p-12 glass-card animate-reiatsu"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.1))",
            border: "1px solid rgba(124,58,237,0.3)",
          }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#f1f5f9", fontFamily: "var(--font-orbitron)" }}>
            Let&apos;s Connect
          </h2>
          <p className="mb-8" style={{ color: "#94a3b8" }}>
            Have a project in mind? Want to collaborate? Or just want to talk anime? Send me a message.
          </p>
          <Link href="/contact" className="btn-neon px-8 py-3 rounded-lg inline-block">
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}

