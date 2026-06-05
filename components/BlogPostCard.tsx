// components/BlogPostCard.tsx
import Image from "next/image";
import type { PostMeta } from "@/lib/blog";
import { categoryColor, formatDate } from "@/lib/blog";

type BlogPostCardProps = { post: PostMeta };

export function BlogPostCard({ post }: BlogPostCardProps) {
  const accent = categoryColor(post.category);
  const mascotSrc = `/brand/mascot/${post.mascot}.png`;

  return (
    <a
      href={`/blog/${post.slug}`}
      className="blog-card"
      style={{
        display: "block",
        position: "relative",
        background: "var(--ink-2)",
        border: "1px solid var(--hair-2)",
        borderLeft: `4px solid ${accent}`,
        borderRadius: 18,
        padding: "28px 28px 48px",
        textDecoration: "none",
        overflow: "visible",
        transition: "transform 220ms ease, box-shadow 220ms ease",
      }}
    >
      {/* Date */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--cream-4)",
          marginBottom: 12,
        }}
      >
        {formatDate(post.publishedAt)}
      </div>

      {/* Category badge */}
      <div
        style={{
          display: "inline-block",
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: accent,
          border: `1px solid ${accent}`,
          borderRadius: 999,
          padding: "3px 10px",
          marginBottom: 14,
          opacity: 0.85,
        }}
      >
        {post.category}
      </div>

      {/* Title */}
      <h2
        className="blog-card-title"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: "clamp(20px, 2.5vw, 26px)",
          lineHeight: 1.15,
          letterSpacing: "-0.01em",
          color: "var(--cream)",
          margin: "0 0 12px",
          transition: "color 200ms",
          paddingRight: 80,
        }}
      >
        {post.title}
      </h2>

      {/* Description */}
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--cream-3)",
          margin: 0,
          paddingRight: 80,
        }}
      >
        {post.description}
      </p>

      {/* Read link */}
      <div
        style={{
          marginTop: 20,
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 500,
          color: accent,
          letterSpacing: "0.04em",
        }}
      >
        Read →
      </div>

      {/* Mascot sticker — overflows bottom-right by ~20px */}
      <div
        aria-hidden={true}
        style={{
          position: "absolute",
          bottom: -20,
          right: -20,
          width: 120,
          height: 120,
          pointerEvents: "none",
          transition: "transform 220ms ease",
        }}
        className="blog-card-mascot"
      >
        <Image
          src={mascotSrc}
          alt=""
          width={120}
          height={120}
          style={{ width: 120, height: 120, objectFit: "contain" }}
        />
      </div>

      <style>{`
        .blog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 48px -16px rgba(0,0,0,0.4);
        }
        .blog-card:hover .blog-card-title {
          color: var(--amber-2, #FFD28E);
        }
        .blog-card:hover .blog-card-mascot {
          transform: scale(1.06);
        }
      `}</style>
    </a>
  );
}
