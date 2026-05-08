"use client";

import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";

export function EventPrintToolbar({ eventId }: Readonly<{ eventId: string }>) {
  return (
    <div
      className="print:hidden"
      style={{
        marginBottom: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <AppBtn variant="ghost" size="sm" href={`/events/${eventId}?tab=share`} as={Link}>
        ← Back to Share
      </AppBtn>
      <AppBtn variant="gold" size="sm" type="button" onClick={() => window.print()}>
        Print
      </AppBtn>
    </div>
  );
}
