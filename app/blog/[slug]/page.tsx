import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { BlogHeader } from "@/components/BlogHeader";
import { getAllPostMeta, getPost, formatDate, categoryColor } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllPostMeta().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Calisto Blog`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const accent = categoryColor(post.category);
  const mascotSrc = `/brand/mascot/${post.mascot}.png`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--ink)" }}>
      <BlogHeader />

      {/* Hero */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid var(--hair)",
        }}
      >
        {/* Radial glow behind mascot */}
        <div
          aria-hidden={true}
          style={{
            position: "absolute",
            top: "50%",
            right: "8%",
            transform: "translate(50%, -50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(165,132,166,0.28) 0%, transparent 65%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div
          className="mx-auto blog-hero-grid"
          style={{
            maxWidth: 1100,
            padding: "56px 32px 0",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 48,
            alignItems: "flex-end",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Left: meta + title */}
          <div style={{ paddingBottom: 56 }}>
            <a
              href="/blog"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--cream-4)",
                textDecoration: "none",
                marginBottom: 32,
                transition: "color 180ms",
              }}
              className="back-link"
            >
              ← All posts
            </a>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: accent,
                  border: `1px solid ${accent}`,
                  borderRadius: 999,
                  padding: "3px 10px",
                  opacity: 0.9,
                }}
              >
                {post.category}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "var(--cream-4)",
                }}
              >
                {formatDate(post.publishedAt)}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontSize: "clamp(30px, 4.5vw, 52px)",
                lineHeight: 1.06,
                letterSpacing: "-0.02em",
                color: "var(--cream)",
                margin: 0,
              }}
            >
              {post.title}
            </h1>
          </div>

          {/* Right: mascot */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            className="blog-hero-mascot"
          >
            <Image
              src={mascotSrc}
              alt="Aurora"
              width={280}
              height={280}
              style={{ width: "min(280px, 100%)", height: "auto", objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Post body */}
      <main
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "64px 32px 32px",
        }}
      >
        <div
          className="blog-prose"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* End CTA */}
        <div
          style={{
            marginTop: 80,
            padding: "40px 32px",
            border: "1px solid var(--hair-2)",
            borderRadius: 20,
            background: "var(--glass-bg)",
            textAlign: "center",
          }}
        >
          <Image
            src="/brand/mascot/aurora_waving.png"
            alt="Aurora waving goodbye"
            width={160}
            height={160}
            style={{ width: 160, height: "auto", objectFit: "contain", margin: "0 auto 20px" }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 22,
              color: "var(--cream)",
              margin: "0 0 24px",
              lineHeight: 1.3,
            }}
          >
            That's all from me — now go make some memories.
          </p>
          <a
            href="/en"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              padding: "11px 26px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              textDecoration: "none",
              letterSpacing: "0.01em",
              boxShadow: "0 8px 28px -8px rgba(240,179,75,0.45)",
            }}
          >
            Try Calisto free →
          </a>
        </div>
      </main>

      <style>{`
        .back-link:hover { color: var(--cream-2); }

        @media (max-width: 700px) {
          .blog-hero-grid { grid-template-columns: 1fr !important; padding-bottom: 0 !important; }
          .blog-hero-mascot { display: none; }
        }

        /* ── Prose typography ── */
        .blog-prose {
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1.8;
          color: var(--cream-2);
        }
        .blog-prose h1 { display: none; }
        .blog-prose h2 {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 1.5em;
          color: var(--cream);
          line-height: 1.15;
          letter-spacing: -0.015em;
          margin: 0.5em 0 0.6em;
          padding-bottom: 0.35em;
          border-bottom: 1px solid var(--hair);
        }
        .blog-prose h3 {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 1.15em;
          color: var(--cream);
          line-height: 1.2;
          margin: 2em 0 0.6em;
        }
        .blog-prose p { margin: 0 0 1.4em; }
        .blog-prose a { color: var(--amber-2, #FFD28E); text-underline-offset: 3px; }
        .blog-prose a:hover { color: var(--gold); }
        .blog-prose strong { color: var(--cream); font-weight: 600; }
        .blog-prose ul, .blog-prose ol {
          padding-left: 1.5em;
          margin: 0 0 1.4em;
          display: flex;
          flex-direction: column;
          gap: 0.45em;
        }
        .blog-prose li { line-height: 1.65; }
        .blog-prose hr {
          border: none;
          border-top: 1px solid var(--hair-2);
          margin: 2.5em 0;
        }

        /* Aurora pull-quote (blockquote) */
        .blog-prose blockquote {
          position: relative;
          border-left: 3px solid var(--plum-2, #A584A6);
          margin: 2em 0;
          padding: 14px 20px 14px 56px;
          background: var(--glass-bg);
          border-radius: 0 10px 10px 0;
          font-family: var(--font-display);
          font-style: italic;
          font-size: 1.1em;
          color: var(--cream-2);
          line-height: 1.5;
        }
        .blog-prose blockquote::before {
          content: '';
          position: absolute;
          top: 14px;
          left: 12px;
          width: 32px;
          height: 32px;
          background: url('/brand/mascot/aurora.png') center/contain no-repeat;
          border-radius: 50%;
        }

        /* Aurora reaction cards (injected before H2s) */
        .blog-prose .aurora-reaction {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 2.5em 0 0.5em;
          padding: 14px 18px;
          background: var(--ink-2);
          border: 1px solid var(--hair-2);
          border-left: 3px solid var(--plum-2, #A584A6);
          border-radius: 0 12px 12px 0;
        }
        .blog-prose .aurora-reaction img {
          width: 72px;
          height: 72px;
          object-fit: contain;
          flex-shrink: 0;
        }
        .blog-prose .aurora-reaction p {
          font-family: var(--font-display);
          font-style: italic;
          font-size: 15px;
          color: var(--cream-2);
          line-height: 1.45;
          margin: 0;
        }

        /* Table */
        .blog-prose table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          margin: 1.75em 0;
        }
        .blog-prose th {
          text-align: left;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--cream-4);
          padding: 10px 14px;
          border-bottom: 1px solid var(--hair-strong);
        }
        .blog-prose td {
          padding: 11px 14px;
          border-bottom: 1px solid var(--hair);
          color: var(--cream-2);
          vertical-align: top;
        }
        .blog-prose tr:last-child td { border-bottom: none; }

        /* Code */
        .blog-prose code {
          font-family: var(--font-mono);
          font-size: 0.875em;
          background: var(--glass-bg-2);
          border: 1px solid var(--hair);
          border-radius: 4px;
          padding: 1px 6px;
          color: var(--amber-2);
        }
        .blog-prose pre {
          background: var(--ink-2);
          border: 1px solid var(--hair-2);
          border-radius: 10px;
          padding: 20px 24px;
          overflow-x: auto;
          margin: 1.75em 0;
        }
        .blog-prose pre code {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          color: var(--cream-2);
        }
      `}</style>
    </div>
  );
}
