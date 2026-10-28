"use client";

import Link from "next/link";
import { MoreHorizontal, RefreshCw, Search } from "lucide-react";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { useAppUi } from "@/components/AppUiProvider";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { AuroraHourglass } from "@/components/app-ui/AuroraHourglass";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { FilterChips, type FilterChip } from "@/components/app-ui/FilterChips";
import { TabHeader } from "@/components/app-ui/TabHeader";
import "./guests-share.css";

type MembershipRole = "organizer" | "guest" | "co_organizer" | string;

type MemberRow = {
  user_id: string;
  role: MembershipRole;
  joined_at: string;
  display_name_at_event: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MediaRow = {
  uploaded_by: string;
  mime_type: string | null;
  storage_path: string;
  thumbnail_path: string | null;
};

type Filter = "all" | "added" | "co";

// Guest avatars: warm tones that all keep white initials above 4.5:1.
const GUEST_TONES = ["#6f5c47", "#8b6a8c", "#8a5f12"];

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

export function GuestsManager({ eventId }: Readonly<{ eventId: string }>) {
  const ui = useAppUi();
  const t = ui.guestsTab;
  const locale = bcp47FromUiLocale(ui.locale);
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [profileNameById, setProfileNameById] = useState<Map<string, string>>(() => new Map());
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [mediaByUser, setMediaByUser] = useState<Map<string, { photos: number; videos: number }>>(() => new Map());
  const [printsByUser, setPrintsByUser] = useState<Map<string, string[]>>(() => new Map());
  const [pendingRemoveUserId, setPendingRemoveUserId] = useState<string | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const uid = sessionRes.data.session?.user.id ?? null;
      setMyUserId(uid);

      const [{ data: ev, error: evErr }, { data: mems, error: memErr }, { data: media, error: mediaErr }] =
        await Promise.all([
          supabase.from("events").select("organizer_id, access_code").eq("id", eventId).single(),
          supabase
            .from("event_memberships")
            .select("user_id, role, joined_at, display_name_at_event")
            .eq("event_id", eventId)
            .order("joined_at", { ascending: true }),
          supabase
            .from("media_items")
            .select("uploaded_by, mime_type, storage_path, thumbnail_path")
            .eq("event_id", eventId)
            .order("created_at", { ascending: false }),
        ]);

      if (evErr) throw new Error(evErr.message);
      if (memErr) throw new Error(memErr.message);
      if (mediaErr) throw new Error(mediaErr.message);

      const evRow = ev as { organizer_id: string; access_code: string | null } | null;
      setOrganizerId(evRow?.organizer_id ?? null);
      setAccessCode(evRow?.access_code ?? null);
      setMembers((mems ?? []) as MemberRow[]);

      const userIds = Array.from(new Set(((mems ?? []) as MemberRow[]).map((m) => m.user_id)));
      if (userIds.length) {
        const { data: profiles, error: profilesErr } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", userIds);
        if (!profilesErr) {
          const map = new Map<string, string>();
          for (const p of (profiles ?? []) as ProfileRow[]) {
            const name = p.display_name?.trim();
            if (name) map.set(p.id, name);
          }
          setProfileNameById(map);
        }
      }

      const map = new Map<string, { photos: number; videos: number }>();
      const picks = new Map<string, string[]>();
      for (const row of (media ?? []) as MediaRow[]) {
        const key = row.uploaded_by;
        const current = map.get(key) ?? { photos: 0, videos: 0 };
        if (isVideoMime(row.mime_type)) current.videos += 1;
        else {
          current.photos += 1;
          const mine = picks.get(key) ?? [];
          if (mine.length < 2) picks.set(key, [...mine, row.thumbnail_path ?? row.storage_path]);
        }
        map.set(key, current);
      }
      setMediaByUser(map);

      // Each member's two newest photos as tiny prints, signed in one batch. Decorative: on any failure the rows just show none.
      const paths = [...picks.values()].flat();
      if (paths.length) {
        void supabase.storage
          .from("event-media")
          .createSignedUrls(paths, 3600)
          .then(({ data }: { data: { path: string | null; signedUrl: string }[] | null }) => {
            const byPath = new Map((data ?? []).filter((s) => s.path && s.signedUrl).map((s) => [s.path, s.signedUrl] as const));
            setPrintsByUser(
              new Map([...picks].map(([user, ps]) => [user, ps.map((p) => byPath.get(p)).filter((u): u is string => Boolean(u))] as const)),
            );
          })
          .catch(() => {});
      } else setPrintsByUser(new Map());
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.guests.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase, ui.guests.loadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  // Row menu: focus the first item on open; Escape (back to the ⋯ button), Tab or a tap outside closes it.
  useEffect(() => {
    if (!openMenuFor) return;
    const menu = document.getElementById(`guest-menu-${openMenuFor}`);
    const trigger = document.getElementById(`guest-more-${openMenuFor}`);
    menu?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenuFor(null);
        trigger?.focus();
      } else if (e.key === "Tab") setOpenMenuFor(null);
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menu?.contains(target) && !trigger?.contains(target)) setOpenMenuFor(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openMenuFor]);

  const isPrimaryOrganizer = Boolean(myUserId && organizerId && myUserId === organizerId);

  if (!supabase) {
    return (
      <div style={{ padding: "24px 0" }}>
        <div
          style={{
            borderRadius: "var(--app-radius-lg)",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-danger) 8%, var(--app-surface))",
            padding: 16,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-danger)" }}>
            {ui.supabase.missingTitle}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
            {ui.guests.configureSupabase}
          </p>
        </div>
      </div>
    );
  }

  function mapRpcErrorMessage(raw: string) {
    if (raw.includes("CANNOT_REMOVE_PRIMARY_ORGANIZER")) return ui.guests.cannotRemoveOrganizer;
    if (raw.includes("ONLY_PRIMARY_ORGANIZER")) return ui.guests.rolesOnlyPrimary;
    if (raw.includes("NOT_ALLOWED")) return ui.guests.notAllowed;
    if (raw.includes("MEMBER_NOT_FOUND")) return ui.guests.memberNotFound;
    return raw || ui.guests.actionFailed;
  }

  async function confirmRemovePending() {
    if (!supabase) return;
    const targetUserId = pendingRemoveUserId;
    if (!targetUserId || busyUserId) return;

    setBusyUserId(targetUserId);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("remove_event_member", {
        p_event_id: eventId,
        p_target_user_id: targetUserId,
      });
      if (rpcErr) throw new Error(mapRpcErrorMessage(rpcErr.message));
      startTransition(() => setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId)));
      setPendingRemoveUserId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.guests.removeMemberFail);
    } finally {
      setBusyUserId(null);
    }
  }

  async function setCoOrganizer(targetUserId: string, make: boolean) {
    if (busyUserId) return;
    setBusyUserId(targetUserId);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("set_member_co_organizer_status", {
        p_event_id: eventId,
        p_target_user_id: targetUserId,
        p_make_co_organizer: make,
      });
      if (rpcErr) throw new Error(mapRpcErrorMessage(rpcErr.message));

      startTransition(() =>
        setMembers((prev) =>
          prev.map((m) => (m.user_id === targetUserId ? { ...m, role: make ? "co_organizer" : "guest" } : m)),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.guests.updateRoleFail);
    } finally {
      setBusyUserId(null);
    }
  }

  function closeMenu(userId: string) {
    setOpenMenuFor(null);
    document.getElementById(`guest-more-${userId}`)?.focus();
  }

  const rows = members.map((m) => {
    const isPrimary = organizerId === m.user_id;
    const display =
      m.display_name_at_event?.trim() ||
      profileNameById.get(m.user_id) ||
      (isPrimary ? ui.guests.organizerLabelFallback : ui.guests.guestLabelFallback);
    const uploads = mediaByUser.get(m.user_id) ?? { photos: 0, videos: 0 };
    return { m, isPrimary, display, uploads, hasUploads: uploads.photos + uploads.videos > 0 };
  });
  const guests = rows.filter((r) => !r.isPrimary);
  const addedCount = guests.filter((r) => r.hasUploads).length;
  const chipCounts = { added: rows.filter((r) => r.hasUploads).length, co: rows.filter((r) => r.m.role === "co_organizer").length };
  const chips: FilterChip<Filter>[] = [
    { id: "all", label: interpolate(t.filterAll, { count: rows.length }) },
    ...(chipCounts.added ? [{ id: "added" as const, label: interpolate(t.filterAdded, { count: chipCounts.added }) }] : []),
    ...(chipCounts.co ? [{ id: "co" as const, label: interpolate(t.filterCo, { count: chipCounts.co }) }] : []),
  ];
  const activeFilter = chips.some((c) => c.id === filter) ? filter : "all";
  const q = query.trim().toLocaleLowerCase();
  const visible = rows.filter(
    (r) =>
      (activeFilter === "all" || (activeFilter === "added" ? r.hasUploads : r.m.role === "co_organizer")) &&
      (!q || r.display.toLocaleLowerCase().includes(q)),
  );
  // After a failed first load, show the error alone instead of an "empty" sentence.
  const loaded = (!loading && !error) || members.length > 0;

  return (
    <section style={{ paddingTop: 6 }}>
      <ConfirmDialog
        open={pendingRemoveUserId !== null}
        title={ui.guests.removeDialogTitle}
        message={ui.guests.removeDialogBody}
        confirmLabel={ui.common.remove}
        cancelLabel={ui.common.cancel}
        variant="danger"
        busy={Boolean(pendingRemoveUserId && busyUserId === pendingRemoveUserId)}
        onConfirm={() => void confirmRemovePending()}
        onCancel={() => {
          if (busyUserId) return;
          setPendingRemoveUserId(null);
        }}
      />

      <TabHeader
        title={ui.guests.title}
        pose="guests"
        actions={
          <button
            type="button"
            className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid"
            aria-label={ui.common.refresh}
            disabled={loading}
            onClick={() => void load()}
          >
            <RefreshCw size={18} strokeWidth={2} aria-hidden className={loading ? "gs-spin" : undefined} />
          </button>
        }
      >
        {!loaded ? null : guests.length === 0 ? (
          ui.guests.empty
        ) : (
          <>
            <b>{plural(locale, guests.length, t.joined)}</b>
            {addedCount > 0 ? `, ${plural(locale, addedCount, t.added)}` : null}
          </>
        )}
      </TabHeader>

      {error ? (
        <p
          role="alert"
          style={{
            fontSize: 14,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            padding: "10px 14px",
            borderRadius: 12,
            margin: "16px 0 0",
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
          }}
        >
          {error}
        </p>
      ) : null}

      {loading && members.length === 0 ? (
        <AuroraHourglass size={72} caption={ui.guests.loadingGuests} style={{ marginTop: 24 }} />
      ) : null}

      {members.length > 0 ? (
        <>
          <label className="guests-search">
            <Search size={18} strokeWidth={2} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label={t.searchPlaceholder}
            />
          </label>

          {chips.length > 1 ? (
            <div style={{ marginTop: 12 }}>
              <FilterChips chips={chips} value={activeFilter} onChange={setFilter} ariaLabel={t.filterLabel} />
            </div>
          ) : null}

          {visible.length === 0 ? (
            <p style={{ margin: "16px 4px 0", fontSize: 14, color: "var(--app-muted)" }}>{t.noMatches}</p>
          ) : (
            <ul className="warm-list" style={{ marginTop: 14 }}>
              {visible.map(({ m, isPrimary, display, uploads }) => {
                const isMe = myUserId === m.user_id;
                const canManage = isPrimaryOrganizer && !isPrimary;
                const canPromoteDemote = canManage && (m.role === "guest" || m.role === "co_organizer");
                const menuOpen = openMenuFor === m.user_id;
                const prints = printsByUser.get(m.user_id) ?? [];
                const avatar: React.CSSProperties = isPrimary
                  ? { background: "linear-gradient(135deg, #f5c76b, #c9912e)", color: "#1b1208" }
                  : m.role === "co_organizer"
                    ? { background: "#5b2d8e" }
                    : { background: GUEST_TONES[m.user_id.charCodeAt(m.user_id.length - 1) % GUEST_TONES.length] };
                const counts = [
                  uploads.photos ? plural(locale, uploads.photos, t.photos) : null,
                  uploads.videos ? plural(locale, uploads.videos, t.videos) : null,
                ].filter(Boolean);
                const meta = [isPrimary ? ui.dashboard.roleOrganizer : null, counts.length ? counts.join(" · ") : t.noUploads]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={`${m.user_id}-${m.joined_at}`} className="guest-row" aria-busy={busyUserId === m.user_id}>
                    <span aria-hidden className="guest-row__avatar" style={avatar}>
                      {display.trim()[0]?.toUpperCase() ?? "?"}
                    </span>
                    <span className="guest-row__body">
                      <span className="guest-row__name">
                        <span className="guest-row__name-text">
                          {display}
                          {isMe ? <span className="guest-row__you"> {ui.guests.youBadge}</span> : null}
                        </span>
                        {m.role === "co_organizer" ? <span className="guest-row__pill">{ui.dashboard.roleCoOrganizer}</span> : null}
                      </span>
                      <span className="guest-row__meta">{meta}</span>
                    </span>
                    {prints.length ? (
                      <span aria-hidden className="guest-row__prints">
                        {prints.map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt=""
                            loading="lazy"
                            className="print-photo"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ))}
                      </span>
                    ) : null}
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          id={`guest-more-${m.user_id}`}
                          className="guest-row__more"
                          aria-label={interpolate(t.optionsFor, { name: display })}
                          aria-haspopup="menu"
                          aria-expanded={menuOpen}
                          aria-controls={menuOpen ? `guest-menu-${m.user_id}` : undefined}
                          disabled={busyUserId !== null}
                          onClick={() => setOpenMenuFor(menuOpen ? null : m.user_id)}
                        >
                          <MoreHorizontal size={20} strokeWidth={2.2} aria-hidden />
                        </button>
                        {menuOpen ? (
                          <div
                            id={`guest-menu-${m.user_id}`}
                            role="menu"
                            aria-label={interpolate(t.optionsFor, { name: display })}
                            className="guest-row__menu"
                            onKeyDown={(e) => {
                              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
                              e.preventDefault();
                              const items = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
                              const i = items.indexOf(document.activeElement as HTMLElement);
                              items[(i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus();
                            }}
                          >
                            {canPromoteDemote ? (
                              <button
                                type="button"
                                role="menuitem"
                                className="guest-album-menu__item"
                                onClick={() => {
                                  closeMenu(m.user_id);
                                  void setCoOrganizer(m.user_id, m.role === "guest");
                                }}
                              >
                                {m.role === "guest" ? ui.guests.promoteCo : ui.guests.demoteGuest}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              role="menuitem"
                              className="guest-album-menu__item guest-album-menu__item--danger"
                              onClick={() => {
                                closeMenu(m.user_id);
                                setPendingRemoveUserId(m.user_id);
                              }}
                            >
                              {t.removeFromEvent}
                            </button>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : null}

      {loaded && accessCode ? (
        <div
          className="tab-card tab-card--raised"
          style={{ position: "relative", marginTop: 20, minHeight: 110, padding: "16px 16px 16px 104px", boxSizing: "border-box" }}
        >
          <Aurora pose="waving" size={80} style={{ position: "absolute", left: 12, bottom: 12 }} />
          <AuroraSays size={19}>{guests.length === 0 ? t.emptySays : t.missingSays}</AuroraSays>
          <Link href={`/events/${eventId}?tab=share`} className="gs-link" style={{ marginTop: 4 }}>
            {interpolate(t.shareCode, { code: accessCode })}
            <span aria-hidden> ›</span>
          </Link>
        </div>
      ) : null}
    </section>
  );
}
