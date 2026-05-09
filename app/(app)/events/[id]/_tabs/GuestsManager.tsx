"use client";

import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { AppBtn } from "@/components/app-ui/AppBtn";

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
};

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

function shortId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

export function GuestsManager({ eventId }: Readonly<{ eventId: string }>) {
  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [profileNameById, setProfileNameById] = useState<Map<string, string>>(() => new Map());
  const [organizerId, setOrganizerId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [mediaByUser, setMediaByUser] = useState<Map<string, { photos: number; videos: number }>>(() => new Map());

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
            Supabase not configured
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
            Set <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> in <code>.env.local</code> to use event admin features.
          </p>
        </div>
      </div>
    );
  }

  const isPrimaryOrganizer = Boolean(myUserId && organizerId && myUserId === organizerId);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sessionRes = await supabase.auth.getSession();
      const uid = sessionRes.data.session?.user.id ?? null;
      setMyUserId(uid);

      const [{ data: ev, error: evErr }, { data: mems, error: memErr }, { data: media, error: mediaErr }] =
        await Promise.all([
          supabase.from("events").select("organizer_id").eq("id", eventId).single(),
          supabase
            .from("event_memberships")
            .select("user_id, role, joined_at, display_name_at_event")
            .eq("event_id", eventId)
            .order("joined_at", { ascending: true }),
          supabase.from("media_items").select("uploaded_by, mime_type").eq("event_id", eventId),
        ]);

      if (evErr) throw new Error(evErr.message);
      if (memErr) throw new Error(memErr.message);
      if (mediaErr) throw new Error(mediaErr.message);

      setOrganizerId((ev as { organizer_id: string } | null)?.organizer_id ?? null);
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
      for (const row of (media ?? []) as MediaRow[]) {
        const key = row.uploaded_by;
        const current = map.get(key) ?? { photos: 0, videos: 0 };
        if (isVideoMime(row.mime_type)) current.videos += 1;
        else current.photos += 1;
        map.set(key, current);
      }
      setMediaByUser(map);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load guests.");
    } finally {
      setLoading(false);
    }
  }, [eventId, supabase]);

  useEffect(() => {
    void load();
  }, [load]);

  function mapRpcErrorMessage(raw: string) {
    if (raw.includes("CANNOT_REMOVE_PRIMARY_ORGANIZER")) return "You can't remove the primary organizer.";
    if (raw.includes("ONLY_PRIMARY_ORGANIZER")) return "Only the primary organizer can change roles.";
    if (raw.includes("NOT_ALLOWED")) return "Not allowed.";
    if (raw.includes("MEMBER_NOT_FOUND")) return "Member not found.";
    return raw || "Action failed.";
  }

  async function removeMember(targetUserId: string) {
    if (busyUserId) return;
    const ok = window.confirm("Remove this member from the event?");
    if (!ok) return;

    setBusyUserId(targetUserId);
    setError(null);
    try {
      const { error: rpcErr } = await supabase.rpc("remove_event_member", {
        p_event_id: eventId,
        p_target_user_id: targetUserId,
      });
      if (rpcErr) throw new Error(mapRpcErrorMessage(rpcErr.message));
      startTransition(() => setMembers((prev) => prev.filter((m) => m.user_id !== targetUserId)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove member.");
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
      setError(e instanceof Error ? e.message : "Could not update role.");
    } finally {
      setBusyUserId(null);
    }
  }

  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <GoldBar vertical />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--app-text)' }}>
              Guests
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--app-muted)' }}>
            {members.length} member{members.length === 1 ? "" : "s"}
          </p>
        </div>
        <AppBtn variant="ghost" small onClick={() => void load()}>Refresh</AppBtn>
      </div>

      {error ? (
        <p
          style={{
            fontSize: 13,
            color: "var(--app-danger)",
            background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
            padding: "10px 14px",
            borderRadius: 10,
            marginBottom: 16,
            border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
          }}
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 24 }}>Loading guests…</p>
      ) : null}

      {!loading && members.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--app-muted)', marginTop: 24 }}>No guests have joined yet.</p>
      ) : null}

      {members.length > 0 ? (
        <ul style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.map((m) => {
            const isMe = myUserId === m.user_id;
            const isPrimary = organizerId === m.user_id;
            const uploads = mediaByUser.get(m.user_id) ?? { photos: 0, videos: 0 };
            const canRemove = isPrimaryOrganizer && !isPrimary;
            const canPromoteDemote = isPrimaryOrganizer && !isPrimary;
            const busy = busyUserId === m.user_id;
            const display =
              m.display_name_at_event?.trim() ||
              profileNameById.get(m.user_id) ||
              (isPrimary ? "Organizer" : "Guest");
            const isOrgRole = m.role === "organizer" || m.role === "co_organizer";
            return (
              <li
                key={`${m.user_id}-${m.joined_at}`}
                style={{
                  background: 'var(--app-card)',
                  borderRadius: 18,
                  border: '1.5px solid var(--app-border)',
                  padding: '14px 18px',
                  fontSize: 14,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {display}
                      {isMe ? (
                        <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: 'var(--app-gold)' }}>(you)</span>
                      ) : null}
                    </p>
                    <p style={{ marginTop: 4, fontFamily: 'monospace', fontSize: 11, color: 'var(--app-muted)' }} title={m.user_id}>
                      {shortId(m.user_id)}
                    </p>
                    <p style={{ marginTop: 6, fontSize: 11, color: 'var(--app-muted)' }}>
                      Uploads: {uploads.photos} photos • {uploads.videos} videos
                    </p>
                  </div>
                  <span style={{
                    flexShrink: 0,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: isOrgRole
                      ? 'color-mix(in srgb, var(--app-gold) 12%, transparent)'
                      : 'color-mix(in srgb, var(--app-muted) 12%, transparent)',
                    border: isOrgRole
                      ? '1.5px solid color-mix(in srgb, var(--app-gold) 30%, transparent)'
                      : '1.5px solid var(--app-border)',
                    color: isOrgRole ? 'var(--app-gold)' : 'var(--app-muted)',
                  }}>
                    {m.role}
                  </span>
                </div>

                {isPrimaryOrganizer ? (
                  <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {canPromoteDemote && (m.role === "guest" || m.role === "co_organizer") ? (
                      <AppBtn
                        variant="ghost"
                        small
                        disabled={busyUserId !== null}
                        onClick={() => void setCoOrganizer(m.user_id, m.role === "guest")}
                      >
                        {busy
                          ? "Working…"
                          : m.role === "guest"
                            ? "Promote to co‑organizer"
                            : "Demote to guest"}
                      </AppBtn>
                    ) : null}
                    {canRemove ? (
                      <AppBtn
                        variant="danger"
                        size="sm"
                        type="button"
                        disabled={busyUserId !== null}
                        loading={busy}
                        onClick={() => void removeMember(m.user_id)}
                      >
                        Remove
                      </AppBtn>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
