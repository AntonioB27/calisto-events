"use client";

import { UserIcon } from "@/components/app-ui/UserIcon";

type Props = Readonly<{
  label: string;
  isMine: boolean;
  mineAria: string;
}>;

export function MediaUploaderChip({ label, isMine, mineAria }: Props) {
  return (
    <div
      className="flex min-w-0 max-w-full items-center gap-1 md:gap-1.5"
      style={{
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.55))",
      }}
    >
      {isMine ? (
        <span className="shrink-0 text-white/95" aria-label={mineAria} title={mineAria}>
          <UserIcon size={11} />
        </span>
      ) : null}
      <span className="truncate text-[10px] font-semibold text-white/95 md:text-xs">{label}</span>
    </div>
  );
}
