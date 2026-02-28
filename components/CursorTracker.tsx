"use client";
import { useEffect, useState } from "react";

export default function CursorTracker() {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    const [isPointer, setIsPointer] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over a clickable element
            const target = e.target as HTMLElement;
            const isClickable = target.closest('button, a, input, select, textarea, [role="button"]');
            setIsPointer(!!isClickable);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <>
            {/* Main glow */}
            <div
                className="fixed top-0 left-0 w-[400px] h-[400px] pointer-events-none z-[1] opacity-40 mix-blend-screen transition-opacity duration-300"
                style={{
                    transform: `translate(${position.x - 200}px, ${position.y - 200}px)`,
                    background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
                }}
            />

            {/* Custom cursor dot */}
            <div
                className="fixed top-0 left-0 w-4 h-4 pointer-events-none z-[9999] rounded-full transition-transform duration-100 ease-out"
                style={{
                    transform: `translate(${position.x - 8}px, ${position.y - 8}px) scale(${isPointer ? 2.5 : 1})`,
                    background: isPointer ? "rgba(147, 51, 234, 0.3)" : "rgba(147, 51, 234, 0.8)",
                    border: isPointer ? "1px solid rgba(147, 51, 234, 0.8)" : "none",
                    boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)",
                }}
            />
        </>
    );
}
