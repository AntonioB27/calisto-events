import type { Metadata } from "next";
import Image from "next/image";
import { BlogHeader } from "@/components/BlogHeader";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getAllPostMeta } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Calisto",
  description: "Tips, guides, and ideas for sharing event photos and memories.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const posts = getAllPostMeta();

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)" }}>
      <BlogHeader />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        {/* Radial glow */}
        <div
          aria-hidden={true}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(165,132,166,0.22) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="mx-auto blog-listing-hero-grid"
          style={{
            maxWidth: 1100,
            padding: "60px 32px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 40,
            alignItems: "center",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left: copy */}
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 18,
              }}
            >
              Aurora's Guidebook
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(40px, 6vw, 72px)",
                lineHeight: 1.0,
                letterSpacing: "-0.025em",
                color: "var(--cream)",
                margin: "0 0 20px",
              }}
            >
              Every memory<br />
              <em style={{ fontStyle: "italic", color: "var(--cream-2)" }}>
                has a story.
              </em>
            </h1>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--cream-3)",
                maxWidth: 420,
                margin: "0 0 36px",
              }}
            >
              Tips, guides, and ideas for your most important celebrations.
            </p>
            {posts.length > 0 && (
              <a
                href={`/blog/${posts[0].slug}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "10px 22px",
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
                  color: "#1b1208",
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                  boxShadow: "0 8px 28px -8px rgba(240,179,75,0.45)",
                }}
              >
                Read the latest →
              </a>
            )}
          </div>

          {/* Right: Aurora planning mascot */}
          <div
            className="blog-listing-hero-mascot"
            style={{
              position: "relative",
              flexShrink: 0,
              marginBottom: -40,
              alignSelf: "flex-end",
            }}
          >
            <Image
              src="/brand/mascot/aurora_planning.png"
              alt="Aurora with a notebook"
              width={280}
              height={280}
              style={{ width: "min(280px, 28vw)", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
        </div>

        <style>{`
          @media (max-width: 640px) {
            .blog-listing-hero-grid { grid-template-columns: 1fr !important; }
            .blog-listing-hero-mascot { display: none; }
          }
        `}</style>
      </section>

      {/* Post grid */}
      <main
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "56px 32px 120px",
        }}
      >
        {posts.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-sans)",
              color: "var(--cream-4)",
              fontSize: 15,
            }}
          >
            No posts yet.
          </p>
        ) : (
          <div
            className="blog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 32,
            }}
          >
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        )}
      </main>

      <style>{`
        @media (max-width: 680px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
