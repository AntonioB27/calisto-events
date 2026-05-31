"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { readCreateEventDraftFromStorage } from "@/lib/create-event-draft";

export function ResumeDraftClient() {
  const router = useRouter();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    if (hasAttemptedRef.current) {
      return;
    }
    hasAttemptedRef.current = true;

    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.get("resume") !== "1") {
      return;
    }

    const draft = readCreateEventDraftFromStorage();
    if (!draft) {
      return;
    }

    const params = new URLSearchParams();
    params.set("step", draft.step);
    params.set("name", draft.name);
    if (draft.emoji) params.set("emoji", draft.emoji);
    params.set("date", draft.date);
    params.set("planId", draft.planId);

    const nextSearch = params.toString();
    const currentWithoutResume = new URLSearchParams(currentUrl.searchParams);
    currentWithoutResume.delete("resume");

    if (currentWithoutResume.toString() === nextSearch) {
      return;
    }

    router.replace(`/events/new?${nextSearch}`);
  }, [router]);

  return null;
}
