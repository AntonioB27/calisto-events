"use client";

import type { MouseEvent } from "react";

import { LikeHeartIcon } from "@/components/app-ui/LikeHeartIcon";

type Props = Readonly<{
  liked: boolean;
  count: number;
  pending: boolean;
  likeAria: string;
  unlikeAria: string;
  onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
}>;

export function MediaLikeBadge({ liked, count, pending, likeAria, unlikeAria, onToggle }: Props) {
  return (
    <button
      type="button"
      aria-label={liked ? unlikeAria : likeAria}
      aria-pressed={liked}
      disabled={pending}
      onClick={onToggle}
      className="inline-flex items-center gap-1 rounded-full border-0 px-2 py-1 text-[11px] font-semibold text-white md:gap-1.5 md:px-2.5 md:py-1.5 md:text-xs"
      style={{
        background: liked ? "rgba(0,0,0,0.22)" : "rgba(0,0,0,0.18)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.7 : 0.92,
        color: liked ? "#fecdd3" : "rgba(255,255,255,0.95)",
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.4))",
      }}
    >
      <LikeHeartIcon filled={liked} size={14} />
      <span aria-hidden>{count}</span>
    </button>
  );
}
