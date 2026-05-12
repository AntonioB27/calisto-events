import type { LandingCopy } from "@/lib/i18n";

/** Markdown representation of the public landing page for agent clients. */
export function landingPageMarkdown(origin: string, locale: string, copy: LandingCopy): string {
  const home = `${origin}/${locale}`;
  const lines: string[] = [
    `# ${copy.pageTitle}`,
    "",
    `**Canonical:** ${home}`,
    "",
    copy.pageDescription,
    "",
    "## Navigation",
    "",
    ...copy.nav.map((n) => `- [${n.label}](${home}${n.href})`),
    "",
    "## Hero",
    "",
    copy.heroTitle,
    "",
    copy.heroDescription,
    "",
    "- " + copy.heroSignals.join("\n- "),
    "",
    "## Plans overview",
    "",
    ...copy.plans.map((p) => `- **${p.name}** (${p.id}): ${p.tailoredFor}`),
    "",
    "## FAQ",
    "",
    ...copy.faq.map((f) => `### ${f.q}\n\n${f.a}\n`),
    "",
    "## Waitlist",
    "",
    copy.waitlist.description,
    "",
    `Submit via \`POST ${origin}/api/waitlist\` (see OpenAPI at ${origin}/openapi.json).`,
    "",
    "## Legal",
    "",
    `- [${copy.footerPrivacy}](${origin}/${locale}/privacy)`,
    `- [${copy.footerTerms}](${origin}/${locale}/terms)`,
    "",
  ];
  return lines.join("\n");
}

export function estimateMarkdownTokens(markdown: string): number {
  return Math.max(1, Math.ceil(markdown.length / 4));
}
