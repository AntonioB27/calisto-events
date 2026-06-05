# Blog Redesign — Aurora's Guidebook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the blog listing and post pages so Aurora is the visual anchor and narrator — hero on listing, mascot sticker on each card, reaction cards injected before every H2 inside posts.

**Architecture:** Extend `lib/blog.ts` with new types and a custom `marked` renderer that injects Aurora reaction cards (plain HTML) before H2 headings at render time. Two page components are rebuilt from scratch. A new isolated `BlogPostCard` component handles card rendering. All rendering is server-side.

**Tech Stack:** Next.js 16 App Router, marked v18 (`new Marked()` instance API), gray-matter, Next.js `<Image>`, Tailwind v4 CSS variables, inline `<style>` tags (project pattern).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `lib/blog.ts` | Types + frontmatter parsing + HTML injection |
| Create | `lib/blog.test.ts` | Unit tests for reaction injection |
| Create | `components/BlogPostCard.tsx` | Isolated listing card |
| Modify | `app/blog/page.tsx` | Listing page redesign |
| Modify | `app/blog/[slug]/page.tsx` | Post page redesign |
| Modify | `content/blog/best-wedding-photo-sharing-apps.md` | Add new frontmatter |

---

## Task 1: Extend types and frontmatter parsing in `lib/blog.ts`

**Files:**
- Modify: `lib/blog.ts`

- [ ] **Step 1: Replace the entire file with the extended version**

```typescript
// lib/blog.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type AuroraReaction = {
  mascot: string;
  quote: string;
};

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  mascot: string;
  category: string;
};

export type Post = PostMeta & {
  html: string;
  auroraReactions: AuroraReaction[];
};

export function getAllPostMeta(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug: (data.slug as string) || slug,
        title: data.title as string,
        description: data.description as string,
        publishedAt: String(data.publishedAt ?? ""),
        updatedAt: String(data.updatedAt ?? ""),
        mascot: (data.mascot as string) || "aurora",
        category: (data.category as string) || "general",
      };
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export function buildReactionHtml(reaction: AuroraReaction): string {
  const src = `/brand/mascot/${reaction.mascot}.png`;
  return `<div class="aurora-reaction"><img src="${src}" alt="Aurora" width="72" height="72" /><p>${reaction.quote}</p></div>`;
}

export function renderPostHtml(
  content: string,
  reactions: AuroraReaction[]
): string {
  let h2Count = 0;
  const instance = new Marked();
  instance.use({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }): string {
        if (depth === 2) {
          const reaction = reactions[h2Count++];
          const card = reaction ? buildReactionHtml(reaction) : "";
          return `${card}<h2>${text}</h2>\n`;
        }
        return `<h${depth}>${text}</h${depth}>\n`;
      },
    },
  });
  return instance.parse(content) as string;
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const reactions: AuroraReaction[] = Array.isArray(data.auroraReactions)
    ? (data.auroraReactions as AuroraReaction[])
    : [];
  return {
    slug: (data.slug as string) || slug,
    title: data.title as string,
    description: data.description as string,
    publishedAt: String(data.publishedAt ?? ""),
    updatedAt: String(data.updatedAt ?? ""),
    mascot: (data.mascot as string) || "aurora",
    category: (data.category as string) || "general",
    auroraReactions: reactions,
    html: renderPostHtml(content, reactions),
  };
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export const CATEGORY_COLORS: Record<string, string> = {
  wedding: "rgba(245,199,107,1)",
  tips: "rgba(165,132,166,1)",
  events: "#9FC58D",
  general: "rgba(110,103,88,1)",
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.general;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "lib/blog"
```
Expected: no output (no errors in blog.ts).

---

## Task 2: Unit test `buildReactionHtml` and `renderPostHtml`

**Files:**
- Create: `lib/blog.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
// lib/blog.test.ts
import { describe, it, expect } from "vitest";
import { buildReactionHtml, renderPostHtml } from "./blog";

describe("buildReactionHtml", () => {
  it("produces an img pointing to the correct mascot path", () => {
    const html = buildReactionHtml({ mascot: "aurora_camera", quote: "Hello" });
    expect(html).toContain('src="/brand/mascot/aurora_camera.png"');
  });

  it("includes the quote text", () => {
    const html = buildReactionHtml({ mascot: "aurora", quote: "Test quote" });
    expect(html).toContain("Test quote");
  });

  it("wraps output in .aurora-reaction", () => {
    const html = buildReactionHtml({ mascot: "aurora", quote: "x" });
    expect(html).toContain('class="aurora-reaction"');
  });
});

describe("renderPostHtml", () => {
  it("injects reaction card before the first H2", () => {
    const md = "## Section One\n\nBody text.";
    const html = renderPostHtml(md, [
      { mascot: "aurora_happy", quote: "Great section!" },
    ]);
    const reactionPos = html.indexOf("aurora-reaction");
    const h2Pos = html.indexOf("<h2>");
    expect(reactionPos).toBeGreaterThanOrEqual(0);
    expect(reactionPos).toBeLessThan(h2Pos);
  });

  it("injects reactions in order — second reaction before second H2", () => {
    const md = "## First\n\nText.\n\n## Second\n\nMore.";
    const html = renderPostHtml(md, [
      { mascot: "aurora", quote: "First reaction" },
      { mascot: "aurora_happy", quote: "Second reaction" },
    ]);
    const firstPos = html.indexOf("First reaction");
    const secondPos = html.indexOf("Second reaction");
    const firstH2Pos = html.indexOf("<h2>");
    const secondH2Pos = html.indexOf("<h2>", firstH2Pos + 1);
    expect(firstPos).toBeLessThan(firstH2Pos);
    expect(secondPos).toBeLessThan(secondH2Pos);
  });

  it("skips the card when reactions run out", () => {
    const md = "## First\n\n## Second\n\n## Third";
    const html = renderPostHtml(md, [
      { mascot: "aurora", quote: "Only one reaction" },
    ]);
    // Exactly one reaction card
    const count = (html.match(/aurora-reaction/g) ?? []).length;
    expect(count).toBe(1);
  });

  it("renders post with no reactions as plain HTML without any reaction cards", () => {
    const md = "## Hello\n\nWorld.";
    const html = renderPostHtml(md, []);
    expect(html).not.toContain("aurora-reaction");
    expect(html).toContain("<h2>");
  });

  it("does not inject cards before H1 or H3 headings", () => {
    const md = "# Title\n\n### Sub\n\n## Real\n\nText.";
    const html = renderPostHtml(md, [
      { mascot: "aurora", quote: "Should appear before H2 only" },
    ]);
    const reactionPos = html.indexOf("aurora-reaction");
    const h1Pos = html.indexOf("<h1>");
    const h3Pos = html.indexOf("<h3>");
    expect(reactionPos).toBeGreaterThan(h1Pos);
    expect(reactionPos).toBeGreaterThan(h3Pos);
  });
});
```

- [ ] **Step 2: Run tests — expect all to pass**

```bash
npx vitest run lib/blog.test.ts
```

Expected: `5 tests passed`.

- [ ] **Step 3: Commit**

```bash
git add lib/blog.ts lib/blog.test.ts
git commit -m "feat: extend blog types with mascot/category/reactions and inject Aurora cards before H2s"
```

---

## Task 3: Update existing post frontmatter

**Files:**
- Modify: `content/blog/best-wedding-photo-sharing-apps.md`

- [ ] **Step 1: Replace the frontmatter block (lines 1–7) with the extended version**

Replace:
```yaml
---
title: "Best Shared Photo Albums for Wedding Guests (2026 Comparison)"
description: "Comparing the best ways for wedding guests to share photos — which apps require downloads, which need accounts, and which let guests contribute instantly from their browser."
slug: best-wedding-photo-sharing-apps
publishedAt: 2026-06-05
updatedAt: 2026-06-05
---
```

With:
```yaml
---
title: "Best Shared Photo Albums for Wedding Guests (2026 Comparison)"
description: "Comparing the best ways for wedding guests to share photos — which apps require downloads, which need accounts, and which let guests contribute instantly from their browser."
slug: best-wedding-photo-sharing-apps
publishedAt: 2026-06-05
updatedAt: 2026-06-05
mascot: aurora_camera
category: wedding
auroraReactions:
  - mascot: aurora_planning
    quote: "Three questions worth answering before you pick anything."
  - mascot: aurora_gallery
    quote: "I made this table so you don't have to read five different websites."
  - mascot: aurora_camera
    quote: "No app, no account — this is the differentiator that actually matters."
  - mascot: aurora_phone
    quote: "Free and familiar — but that Google account requirement trips people up every time."
  - mascot: aurora_happy
    quote: "Capsule is great if your guests are all under 35 and have their phones handy."
  - mascot: aurora_key
    quote: "iPhone-only is a real limitation. One Android guest and this falls apart."
  - mascot: aurora_recording
    quote: "WhatsApp works for a dinner of twelve. It does not work for a wedding of 120."
  - mascot: aurora_guests
    quote: "Match the tool to how many guests you have and how tech-comfortable they are."
  - mascot: aurora_photo
    quote: "The photos that get shared are the ones where sharing was effortless."
  - mascot: aurora_waving
    quote: "Set it up before the day, display the QR at every table, and let it fill itself."
---
```

- [ ] **Step 2: Verify `getPost` parses 10 reactions correctly**

```bash
node -e "
const { getPost } = require('./lib/blog.ts');
" 2>&1 | head -5
```

(This will fail since it's TypeScript — use the type-check instead:)

```bash
npx tsc --noEmit 2>&1 | grep "blog"
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add content/blog/best-wedding-photo-sharing-apps.md
git commit -m "content: add mascot, category, and aurora reactions to wedding photo sharing post"
```

---

## Task 4: Create `components/BlogPostCard.tsx`

**Files:**
- Create: `components/BlogPostCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
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

      {/* Mascot sticker — overflows bottom-right */}
      <div
        aria-hidden
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep "BlogPostCard"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/BlogPostCard.tsx
git commit -m "feat: add BlogPostCard component with mascot sticker and category accent"
```

---

## Task 5: Redesign `app/blog/page.tsx`

**Files:**
- Modify: `app/blog/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// app/blog/page.tsx
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
          aria-hidden
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "blog/page"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/blog/page.tsx
git commit -m "feat: redesign blog listing page with Aurora hero and mascot-sticker post cards"
```

---

## Task 6: Redesign `app/blog/[slug]/page.tsx`

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
// app/blog/[slug]/page.tsx
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
          aria-hidden
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
              {/* Category badge */}
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
              {/* Date */}
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
            alt="Aurora waving"
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
          border-left: 3px solid var(--plum-2, #A584A6);
          border-radius: 0 12px 12px 0;
          border: 1px solid var(--hair-2);
          border-left: 3px solid var(--plum-2, #A584A6);
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
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "slug"
```

Expected: no output.

- [ ] **Step 3: Run the dev server and open `/blog` in a browser**

```bash
npm run dev
```

Open `http://localhost:3000/blog` — verify:
- Hero shows with aurora_planning mascot on the right
- Post card appears with the gold accent border and aurora_camera mascot sticker in the bottom-right corner

Open `http://localhost:3000/blog/best-wedding-photo-sharing-apps` — verify:
- Post hero shows aurora_camera mascot on the right
- Aurora reaction cards appear before each H2 heading
- End CTA shows aurora_waving mascot

- [ ] **Step 4: Commit**

```bash
git add app/blog/[slug]/page.tsx
git commit -m "feat: redesign blog post page with Aurora hero, reaction cards, and waving CTA"
```
