import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

const SCHEMA = "https://schemas.agentskills.io/discovery/0.2.0/schema.json";

export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const skillPath = join(process.cwd(), "public", ".well-known", "agent-skills", "calisto", "SKILL.md");
  let digest = "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  let url = `${origin}/.well-known/agent-skills/calisto/SKILL.md`;

  try {
    const buf = await readFile(skillPath);
    digest = `sha256:${createHash("sha256").update(buf).digest("hex")}`;
  } catch {
    // fall back to empty hash if file missing in deployment
  }

  const body = {
    $schema: SCHEMA,
    skills: [
      {
        name: "calisto-landing",
        type: "skill-md",
        description: "Overview of Calisto public APIs and agent discovery on this site.",
        url,
        digest,
      },
    ],
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
