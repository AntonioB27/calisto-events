import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n";
import { getAllPostMeta } from "@/lib/blog";
import { getPublicOrigin } from "@/lib/public-origin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getPublicOrigin();
  const now = new Date();

  const localeHome = LOCALES.map((locale: Locale) => ({
    url: `${base}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: locale === DEFAULT_LOCALE ? 1 : 0.9,
  }));

  const staticPaths = ["/privacy", "/terms", "/welcome", "/join"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const localizedLegal = LOCALES.flatMap((locale: Locale) =>
    (["privacy", "terms"] as const).map((seg) => ({
      url: `${base}/${locale}/${seg}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  );

  const blogIndex = { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 };

  const blogPosts = getAllPostMeta().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...localeHome, ...staticPaths, ...localizedLegal, blogIndex, ...blogPosts];
}
