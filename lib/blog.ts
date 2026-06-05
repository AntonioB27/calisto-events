// lib/blog.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked, type Tokens } from "marked";

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
        title: String(data.title ?? ""),
        description: String(data.description ?? ""),
        publishedAt: String(data.publishedAt ?? ""),
        updatedAt: String(data.updatedAt ?? ""),
        mascot: (data.mascot as string) || "aurora",
        category: (data.category as string) || "general",
      };
    })
    .sort((a, b) => {
      const ta = new Date(a.publishedAt).getTime();
      const tb = new Date(b.publishedAt).getTime();
      if (isNaN(ta)) return 1;
      if (isNaN(tb)) return -1;
      return tb - ta;
    });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildReactionHtml(reaction: AuroraReaction): string {
  const safeMascot = encodeURIComponent(reaction.mascot.replace(/[^a-z0-9_-]/gi, ""));
  const src = `/brand/mascot/${safeMascot}.png`;
  return `<div class="aurora-reaction"><img src="${src}" alt="Aurora" width="72" height="72" /><p>${escapeHtml(reaction.quote)}</p></div>`;
}

export function renderPostHtml(
  content: string,
  reactions: AuroraReaction[]
): string {
  let h2Count = 0;
  const instance = new Marked();
  instance.use({
    renderer: {
      heading({ tokens, depth }: Tokens.Heading): string {
        const text = this.parser.parseInline(tokens);
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
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const reactions: AuroraReaction[] = Array.isArray(data.auroraReactions)
    ? (data.auroraReactions as AuroraReaction[])
    : [];
  return {
    slug: (data.slug as string) || slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
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
