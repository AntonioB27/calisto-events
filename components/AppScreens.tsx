// Rendered app screen mockups — used in AppPreviewWindow in place of static screenshots.
// Each component fills its container (position:absolute inset:0 from parent).
import type { LandingCopy } from "@/lib/i18n";

type ScreenProps = { copy: LandingCopy };

type PreviewText = {
  tabsAll: string;
  tabsMine: string;
  tabsStarred: string;
  albumMetaPhotos: string;
  dashboardTitle: string;
  dashboardPhotosCollected: string;
  dashboardGuestContributors: string;
  dashboardStorageUsed: string;
  dashboardTodayTemplate: string;
  dashboardForeverPlan: string;
  dashboardVideos: string;
  dashboardPending: string;
  uploadingPhotos: string;
  done: string;
  waiting: string;
  guestWelcomeInviteYou: string;
  guestWelcomeShareMyPhotos: string;
  guestWelcomeViewAlbum: string;
  guestWelcomeNoAccount: string;
  guestWelcomeOriginals: string;
  photoPickerCameraRoll: string;
  photoPickerSelectedTemplate: string;
  photoPickerPhotosSelectedTemplate: string;
  photoPickerClear: string;
  photoPickerUploadTemplate: string;
  photoDetailUploadedBy: string;
  photoDetailStarred: string;
  photoDetailHide: string;
  photoDetailDownload: string;
  photoDetailApprove: string;
  guestListTitle: string;
  guestListMeta: string;
  guestListLive: string;
  guestListAnonymousGuest: string;
  moderationTitle: string;
  moderationPendingApprovalTemplate: string;
  moderationNewTemplate: string;
  moderationAnonymous: string;
  moderationMinutesAgoTemplate: string;
  moderationRejectAll: string;
  moderationApproveAll: string;
  shareTitle: string;
  shareMeta: string;
  shareAlbumLive: string;
  shareUploadsOpen: string;
  shareOrVia: string;
  shareMessage: string;
  shareEmail: string;
  shareCopyLink: string;
  shareNoAppNoAccountOriginals: string;
  downloadTitle: string;
  downloadMetaOriginals: string;
  downloadMemoriesLine1: string;
  downloadMemoriesLine2: string;
  downloadOriginalQuality: string;
  downloadAllPhotosVideos: string;
  downloadPhotosOnly: string;
  downloadStarredOnly: string;
  downloadPrepare: string;
  downloadReadyInMinutes: string;
  downloadLinkByEmail: string;
};

function getPreviewText(copy: LandingCopy): PreviewText {
  if (copy.languageLabel === "Jezik") {
    return {
      tabsAll: "Sve · 247",
      tabsMine: "Moje · 18",
      tabsStarred: "★ Označeno",
      albumMetaPhotos: "FOTOGRAFIJA",
      dashboardTitle: "Pregled",
      dashboardPhotosCollected: "Skupljene fotografije",
      dashboardGuestContributors: "Gosti koji sudjeluju",
      dashboardStorageUsed: "Iskorištena pohrana",
      dashboardTodayTemplate: "+{count} danas",
      dashboardForeverPlan: "FOREVER PAKET",
      dashboardVideos: "Videa",
      dashboardPending: "Na čekanju",
      uploadingPhotos: "Upload fotografija",
      done: "GOTOVO",
      waiting: "ČEKA",
      guestWelcomeInviteYou: "te pozivaju",
      guestWelcomeShareMyPhotos: "Podijeli moje fotografije →",
      guestWelcomeViewAlbum: "Pogledaj album",
      guestWelcomeNoAccount: "Nije potreban račun. Nema preuzimanja aplikacije.",
      guestWelcomeOriginals: "Originali stižu paru.",
      photoPickerCameraRoll: "Galerija",
      photoPickerSelectedTemplate: "{count} odabrano",
      photoPickerPhotosSelectedTemplate: "{count} FOTOGRAFIJA ODABRANO",
      photoPickerClear: "OČISTI",
      photoPickerUploadTemplate: "Učitaj {count} fotografija →",
      photoDetailUploadedBy: "Učitao/la",
      photoDetailStarred: "★ Označeno",
      photoDetailHide: "Sakrij",
      photoDetailDownload: "Preuzmi",
      photoDetailApprove: "Odobri",
      guestListTitle: "Gosti",
      guestListMeta: "84 SUDIONIKA · 247 FOTOGRAFIJA",
      guestListLive: "Uživo",
      guestListAnonymousGuest: "Anonimni gost",
      moderationTitle: "Pregled",
      moderationPendingApprovalTemplate: "{count} ČEKA ODOBRENJE",
      moderationNewTemplate: "{count} NOVO",
      moderationAnonymous: "Anonimno",
      moderationMinutesAgoTemplate: "prije {count}m",
      moderationRejectAll: "Odbij sve",
      moderationApproveAll: "Odobri sve",
      shareTitle: "Pozovi goste",
      shareMeta: "MAYA & LUKA · PODIJELI OVAJ ALBUM",
      shareAlbumLive: "Album je uživo",
      shareUploadsOpen: "upload otvoren",
      shareOrVia: "ili podijeli putem",
      shareMessage: "Poruka",
      shareEmail: "Email",
      shareCopyLink: "Kopiraj link",
      shareNoAppNoAccountOriginals: "Bez aplikacije · bez računa · samo originali",
      downloadTitle: "Preuzmi album",
      downloadMetaOriginals: "MAYA & LUKA · 247 ORIGINALA",
      downloadMemoriesLine1: "Tvoje uspomene,",
      downloadMemoriesLine2: "na jednom mjestu.",
      downloadOriginalQuality: "14.2 GB · originalna kvaliteta",
      downloadAllPhotosVideos: "Sve fotografije i videa",
      downloadPhotosOnly: "Samo fotografije",
      downloadStarredOnly: "★ Samo označeno",
      downloadPrepare: "Pripremi preuzimanje →",
      downloadReadyInMinutes: "Datoteke spremne za nekoliko minuta",
      downloadLinkByEmail: "link stiže emailom",
    };
  }
  if (copy.languageLabel === "Sprache") {
    return {
      tabsAll: "Alle · 247",
      tabsMine: "Meine · 18",
      tabsStarred: "★ Markiert",
      albumMetaPhotos: "FOTOS",
      dashboardTitle: "Übersicht",
      dashboardPhotosCollected: "Gesammelte Fotos",
      dashboardGuestContributors: "Beitragende Gäste",
      dashboardStorageUsed: "Genutzter Speicher",
      dashboardTodayTemplate: "+{count} heute",
      dashboardForeverPlan: "FOREVER TARIF",
      dashboardVideos: "Videos",
      dashboardPending: "Ausstehend",
      uploadingPhotos: "Fotos werden hochgeladen",
      done: "FERTIG",
      waiting: "WARTET",
      guestWelcomeInviteYou: "laden dich ein",
      guestWelcomeShareMyPhotos: "Meine Fotos teilen →",
      guestWelcomeViewAlbum: "Album ansehen",
      guestWelcomeNoAccount: "Kein Konto nötig. Keine App nötig.",
      guestWelcomeOriginals: "Originale direkt ans Paar.",
      photoPickerCameraRoll: "Aufnahmen",
      photoPickerSelectedTemplate: "{count} ausgewählt",
      photoPickerPhotosSelectedTemplate: "{count} FOTOS AUSGEWÄHLT",
      photoPickerClear: "LÖSCHEN",
      photoPickerUploadTemplate: "{count} Fotos hochladen →",
      photoDetailUploadedBy: "Hochgeladen von",
      photoDetailStarred: "★ Markiert",
      photoDetailHide: "Ausblenden",
      photoDetailDownload: "Download",
      photoDetailApprove: "Freigeben",
      guestListTitle: "Gäste",
      guestListMeta: "84 BEITRAGENDE · 247 FOTOS",
      guestListLive: "Live",
      guestListAnonymousGuest: "Anonymer Gast",
      moderationTitle: "Prüfen",
      moderationPendingApprovalTemplate: "{count} WARTEN AUF FREIGABE",
      moderationNewTemplate: "{count} NEU",
      moderationAnonymous: "Anonym",
      moderationMinutesAgoTemplate: "vor {count}m",
      moderationRejectAll: "Alle ablehnen",
      moderationApproveAll: "Alle freigeben",
      shareTitle: "Gäste einladen",
      shareMeta: "MAYA & LUKA · DIESES ALBUM TEILEN",
      shareAlbumLive: "Album ist live",
      shareUploadsOpen: "Uploads offen",
      shareOrVia: "oder teilen via",
      shareMessage: "Nachricht",
      shareEmail: "E-Mail",
      shareCopyLink: "Link kopieren",
      shareNoAppNoAccountOriginals: "Keine App · kein Konto · nur Originale",
      downloadTitle: "Album herunterladen",
      downloadMetaOriginals: "MAYA & LUKA · 247 ORIGINALE",
      downloadMemoriesLine1: "Deine Erinnerungen,",
      downloadMemoriesLine2: "alles an einem Ort.",
      downloadOriginalQuality: "14.2 GB · Originalqualität",
      downloadAllPhotosVideos: "Alle Fotos & Videos",
      downloadPhotosOnly: "Nur Fotos",
      downloadStarredOnly: "★ Nur markierte",
      downloadPrepare: "Download vorbereiten →",
      downloadReadyInMinutes: "Dateien in wenigen Minuten bereit",
      downloadLinkByEmail: "Link per E-Mail gesendet",
    };
  }
  return {
    tabsAll: "All · 247",
    tabsMine: "Mine · 18",
    tabsStarred: "★ Starred",
    albumMetaPhotos: "PHOTOS",
    dashboardTitle: "Overview",
    dashboardPhotosCollected: "Photos collected",
    dashboardGuestContributors: "Guest contributors",
    dashboardStorageUsed: "Storage used",
    dashboardTodayTemplate: "+{count} today",
    dashboardForeverPlan: "FOREVER PLAN",
    dashboardVideos: "Videos",
    dashboardPending: "Pending",
    uploadingPhotos: "Uploading photos",
    done: "DONE",
    waiting: "WAITING",
    guestWelcomeInviteYou: "invite you",
    guestWelcomeShareMyPhotos: "Share my photos →",
    guestWelcomeViewAlbum: "View album",
    guestWelcomeNoAccount: "No account needed. No app to download.",
    guestWelcomeOriginals: "Your originals, delivered to the couple.",
    photoPickerCameraRoll: "Camera Roll",
    photoPickerSelectedTemplate: "{count} selected",
    photoPickerPhotosSelectedTemplate: "{count} PHOTOS SELECTED",
    photoPickerClear: "CLEAR",
    photoPickerUploadTemplate: "Upload {count} photos →",
    photoDetailUploadedBy: "Uploaded by",
    photoDetailStarred: "★ Starred",
    photoDetailHide: "Hide",
    photoDetailDownload: "Download",
    photoDetailApprove: "Approve",
    guestListTitle: "Guests",
    guestListMeta: "84 CONTRIBUTORS · 247 PHOTOS",
    guestListLive: "Live",
    guestListAnonymousGuest: "Anonymous guest",
    moderationTitle: "Review",
    moderationPendingApprovalTemplate: "{count} PENDING APPROVAL",
    moderationNewTemplate: "{count} NEW",
    moderationAnonymous: "Anonymous",
    moderationMinutesAgoTemplate: "{count}m ago",
    moderationRejectAll: "Reject all",
    moderationApproveAll: "Approve all",
    shareTitle: "Invite guests",
    shareMeta: "MAYA & LUKA · SHARE THIS ALBUM",
    shareAlbumLive: "Album is live",
    shareUploadsOpen: "uploads open",
    shareOrVia: "or share via",
    shareMessage: "Message",
    shareEmail: "Email",
    shareCopyLink: "Copy link",
    shareNoAppNoAccountOriginals: "No app · no account · originals only",
    downloadTitle: "Download album",
    downloadMetaOriginals: "MAYA & LUKA · 247 ORIGINALS",
    downloadMemoriesLine1: "Your memories,",
    downloadMemoriesLine2: "all in one place.",
    downloadOriginalQuality: "14.2 GB · original quality",
    downloadAllPhotosVideos: "All photos & videos",
    downloadPhotosOnly: "Photos only",
    downloadStarredOnly: "★ Starred only",
    downloadPrepare: "Prepare download →",
    downloadReadyInMinutes: "Files ready in a few minutes",
    downloadLinkByEmail: "link sent by email",
  };
}

function StatusBar() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px 4px",
        fontSize: "8.5px",
        fontWeight: 600,
        color: "var(--cream)",
        flexShrink: 0,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        <svg width="10" height="7" viewBox="0 0 18 12" fill="currentColor" aria-hidden>
          <rect x="0" y="3" width="3" height="6" rx="1" />
          <rect x="5" y="1" width="3" height="8" rx="1" />
          <rect x="10" y="0" width="3" height="9" rx="1" opacity="0.4" />
        </svg>
        <svg width="12" height="7" viewBox="0 0 20 14" fill="currentColor" aria-hidden>
          <path d="M10 4C7 4 4 5.5 2 8l2 2c1.5-1.5 3.5-2.5 6-2.5s4.5 1 6 2.5l2-2C16 5.5 13 4 10 4z" opacity="0.6" />
          <circle cx="10" cy="12" r="1.5" />
        </svg>
        <svg width="16" height="7" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
          <rect x="1" y="1" width="19" height="10" rx="2" />
          <rect x="3" y="3" width="12" height="6" rx="1" fill="currentColor" />
          <rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

const PH_GRADS: Record<string, { a: string; b: string }> = {
  amber: { a: "#5c3d1f", b: "#231510" },
  plum:  { a: "#4a3347", b: "#1a1220" },
  rose:  { a: "#5a3436", b: "#231418" },
  sage:  { a: "#2f3a32", b: "#16181a" },
  ink:   { a: "#252030", b: "#0e0b12" },
  gold:  { a: "#5a4629", b: "#22180e" },
  teal:  { a: "#263a3a", b: "#101a1a" },
};

function Tile({ color, label, tall }: { color: string; label?: string; tall?: boolean }) {
  const g = PH_GRADS[color] ?? { a: "#3a2f32", b: "#1a1218" };
  return (
    <div
      aria-hidden
      style={{
        background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
        gridRow: tall ? "span 2" : undefined,
        aspectRatio: tall ? "1/2" : "1",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(0,0,0,0.4) 100%)",
          pointerEvents: "none",
        }}
      />
      {label && (
        <span
          style={{
            position: "absolute",
            bottom: 3,
            left: 5,
            fontFamily: "var(--font-mono)",
            fontSize: 5,
            letterSpacing: "0.1em",
            color: "rgba(244,234,217,0.45)",
            zIndex: 2,
            textTransform: "lowercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function SmallTile({ color }: { color: string }) {
  const g = PH_GRADS[color] ?? { a: "#3a2f32", b: "#1a1218" };
  return (
    <div
      aria-hidden
      style={{
        width: 34,
        height: 34,
        borderRadius: 6,
        background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
        flexShrink: 0,
      }}
    />
  );
}

// ── Screen 1: Album Grid ────────────────────────────────────────────────────
export function AlbumGridScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const tabs = [t.tabsAll, t.tabsMine, t.tabsStarred];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
        position: "relative",
      }}
    >
      <StatusBar />
      {/* App bar */}
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--cream)",
                lineHeight: 1.1,
              }}
            >
              Maya &amp; Luka
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                color: "var(--cream-4, #6E6758)",
                marginTop: 2,
                letterSpacing: "0.08em",
              }}
            >
              12.06.26 · DUBROVNIK · 247 {t.albumMetaPhotos}
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 2 }}>
            {(["#E6A760", "#A584A6", "#C08B8E"] as const).map((c, i) => (
              <div
                key={c}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: c,
                  border: "1.5px solid #120E17",
                  marginLeft: i === 0 ? 0 : -6,
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          padding: "0 14px",
          borderBottom: "1px solid rgba(244,234,217,0.08)",
          flexShrink: 0,
          gap: 0,
        }}
      >
        {tabs.map((t, i) => (
          <div
            key={t}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: i === 0 ? "var(--cream)" : "var(--cream-4, #6E6758)",
              padding: "8px 10px 8px 0",
              position: "relative",
              whiteSpace: "nowrap",
            }}
          >
            {t}
            {i === 0 && (
              <span
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: 0,
                  right: 10,
                  height: 1.5,
                  background: "var(--plum-2, #A584A6)",
                }}
              />
            )}
          </div>
        ))}
      </div>
      {/* Photo grid — matches Screen 1 layout */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          overflow: "hidden",
        }}
      >
        <Tile color="amber" label="first dance" tall />
        <Tile color="rose"  label="bouquet" />
        <Tile color="plum"  label="table 4" />
        <Tile color="gold"  label="candlelight" />
        <Tile color="sage"  label="olive trees" />
        <Tile color="ink"   label="late night" />
        <Tile color="plum"  label="grandma" />
        <Tile color="rose"  label="dance floor" tall />
        <Tile color="amber" label="toast" />
        <Tile color="teal"  label="sea view" />
        <Tile color="gold"  label="cake" />
      </div>
      {/* FAB */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "var(--plum)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--cream)",
          boxShadow: "0 8px 24px -4px rgba(139,106,140,0.5), 0 0 0 5px rgba(139,106,140,0.12)",
          zIndex: 5,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
    </div>
  );
}

// ── Screen 6: Dashboard ─────────────────────────────────────────────────────
export function DashboardScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const stats = [
    { label: t.dashboardPhotosCollected, val: "247", delta: t.dashboardTodayTemplate.replace("{count}", "18"), fill: "72%", color: "var(--plum-2, #A584A6)" },
    { label: t.dashboardGuestContributors, val: "84",  delta: t.dashboardTodayTemplate.replace("{count}", "6"),  fill: "55%", color: "var(--amber, #E6A760)" },
    { label: t.dashboardStorageUsed, val: "14.2 GB", delta: t.dashboardForeverPlan, fill: "28%", color: "var(--plum-2, #A584A6)" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--cream)",
            lineHeight: 1.1,
          }}
        >
          {t.dashboardTitle}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            marginTop: 2,
            letterSpacing: "0.08em",
          }}
        >
          MAYA &amp; LUKA ·{" "}
          <span style={{ color: "var(--plum-2, #A584A6)" }}>●</span>{" "}
          {t.guestListLive}
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(244,234,217,0.04)",
              border: "1px solid rgba(244,234,217,0.08)",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                marginBottom: 5,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: s.val.length > 4 ? 18 : 26,
                  fontWeight: 400,
                  color: "var(--cream)",
                  lineHeight: 1,
                }}
              >
                {s.val}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 8,
                  color: s.color,
                  letterSpacing: "0.1em",
                }}
              >
                {s.delta}
              </div>
            </div>
            <div
              style={{
                height: 3,
                borderRadius: 999,
                background: "rgba(244,234,217,0.06)",
                marginTop: 10,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: s.fill,
                  borderRadius: 999,
                  background: s.color,
                }}
              />
            </div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div
            style={{
              background: "rgba(244,234,217,0.04)",
              border: "1px solid rgba(244,234,217,0.08)",
              borderRadius: 12,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                marginBottom: 3,
              }}
            >
              {t.dashboardVideos}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                color: "var(--cream)",
              }}
            >
              16
            </div>
          </div>
          <div
            style={{
              background: "rgba(244,234,217,0.04)",
              border: "1px solid rgba(244,234,217,0.08)",
              borderRadius: 12,
              padding: "8px 10px",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--cream-4, #6E6758)",
                marginBottom: 3,
              }}
            >
              {t.dashboardPending}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                color: "var(--amber, #E6A760)",
              }}
            >
              3
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 4: Upload Progress ───────────────────────────────────────────────
export function UploadProgressScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const files = [
    { color: "amber", name: "IMG_4821.heic", size: "3.2 MB", pct: 100, done: true,  waiting: false },
    { color: "plum",  name: "IMG_4822.heic", size: "4.1 MB", pct: 78,  done: false, waiting: false },
    { color: "sage",  name: "IMG_4823.heic", size: "2.8 MB", pct: 34,  done: false, waiting: false },
    { color: "gold",  name: "IMG_4824.heic", size: "5.6 MB", pct: 0,   done: false, waiting: true },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--cream)",
            lineHeight: 1.1,
          }}
        >
          {t.uploadingPhotos}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            marginTop: 2,
            letterSpacing: "0.08em",
          }}
        >
          TO MAYA &amp; LUKA · 6 OF 6
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          overflow: "hidden",
        }}
      >
        {/* Thumbnail strip */}
        <div style={{ display: "flex", gap: 6, marginBottom: 2, flexShrink: 0 }}>
          {(["amber", "plum", "sage", "gold", "ink", "teal"] as const).map((c) => (
            <SmallTile key={c} color={c} />
          ))}
        </div>
        {/* File list */}
        {files.map((f) => {
          const g = PH_GRADS[f.color] ?? { a: "#3a2f32", b: "#1a1218" };
          return (
            <div
              key={f.name}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                padding: "8px 10px",
                background: "rgba(244,234,217,0.04)",
                borderRadius: 10,
                border: "1px solid rgba(244,234,217,0.08)",
                opacity: f.waiting ? 0.4 : 1,
                flexShrink: 0,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--cream-2, #E8DCC6)",
                    marginBottom: 5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.name}
                </div>
                <div
                  style={{
                    height: 2.5,
                    borderRadius: 999,
                    background: "rgba(244,234,217,0.08)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${f.pct}%`,
                      background: "var(--plum-2, #A584A6)",
                      boxShadow: f.pct > 0 ? "0 0 6px rgba(165,132,166,0.5)" : undefined,
                      borderRadius: 999,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    color: "var(--cream-4, #6E6758)",
                    marginTop: 3,
                    letterSpacing: "0.1em",
                  }}
                >
                  {f.size} · {f.done ? t.done : f.waiting ? t.waiting : `${f.pct}%`}
                </div>
              </div>
              {f.done && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--plum-2, #A584A6)"
                  strokeWidth="2.5"
                  aria-hidden
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Screen 2: Guest Welcome ─────────────────────────────────────────────────
export function GuestWelcomeScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <div
        style={{
          padding: "12px 16px 4px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "8.5px",
          fontWeight: 600,
          color: "var(--cream)",
          flexShrink: 0,
        }}
      >
        <span>9:41</span>
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          gap: 16,
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, var(--plum-2, #A584A6), var(--plum, #8B6A8C))",
              boxShadow: "0 0 10px rgba(165,132,166,0.4)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 13,
              color: "var(--cream)",
            }}
          >
            Calisto
            <em style={{ fontStyle: "italic", color: "var(--cream-3, #B5AB99)" }}>.</em>
          </span>
        </div>
        {/* Orb */}
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, rgba(165,132,166,0.4), rgba(139,106,140,0.15) 60%, transparent)",
            border: "1px solid rgba(165,132,166,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 40px rgba(139,106,140,0.2)",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(165,132,166,0.7)" strokeWidth="1.4">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        {/* Names */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 20,
            fontWeight: 400,
            color: "var(--cream)",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Maya &amp; Luka<br />{t.guestWelcomeInviteYou}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "var(--cream-4, #6E6758)",
            textAlign: "center",
          }}
        >
          12 · JUNE · 2026 · DUBROVNIK
        </div>
        {/* Buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 7 }}>
          <div
            style={{
              width: "100%",
              background: "var(--plum)",
              color: "var(--cream)",
              borderRadius: 999,
              padding: "11px",
              fontSize: 11,
              fontWeight: 500,
              fontFamily: "var(--font-sans)",
              textAlign: "center",
            }}
          >
            {t.guestWelcomeShareMyPhotos}
          </div>
          <div
            style={{
              background: "transparent",
              border: "1px solid rgba(244,234,217,0.14)",
              color: "var(--cream-3, #B5AB99)",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderRadius: 999,
              padding: "8px 14px",
              textAlign: "center",
              width: "100%",
            }}
          >
            {t.guestWelcomeViewAlbum}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.1em",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          {t.guestWelcomeNoAccount}<br />
          {t.guestWelcomeOriginals}
        </div>
      </div>
    </div>
  );
}

// ── Screen 3: Photo Picker ──────────────────────────────────────────────────
export function PhotoPickerScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const grid = [
    { color: "amber", selected: true,  label: "first dance" },
    { color: "plum",  selected: true,  label: "ceremony" },
    { color: "rose",  selected: false, label: "" },
    { color: "sage",  selected: true,  label: "" },
    { color: "gold",  selected: false, label: "" },
    { color: "ink",   selected: true,  label: "" },
    { color: "teal",  selected: true,  label: "" },
    { color: "rose",  selected: false, label: "" },
    { color: "amber", selected: true,  label: "" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <div
        style={{
          padding: "12px 16px 4px",
          fontSize: "8.5px",
          fontWeight: 600,
          color: "var(--cream)",
          flexShrink: 0,
        }}
      >
        9:41
      </div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 14px 10px",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--cream-3, #B5AB99)" }}>{t.photoPickerCameraRoll}</span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.12em",
            color: "var(--plum-2, #A584A6)",
          }}
        >
          {t.photoPickerSelectedTemplate.replace("{count}", "6")}
        </span>
      </div>
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 2,
          flex: 1,
          overflow: "hidden",
        }}
      >
        {grid.map((cell, i) => {
          const g = PH_GRADS[cell.color] ?? { a: "#3a2f32", b: "#1a1218" };
          return (
            <div
              key={i}
              aria-hidden
              style={{
                background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
                aspectRatio: "1",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {cell.label && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 3,
                    left: 5,
                    fontFamily: "var(--font-mono)",
                    fontSize: 5,
                    letterSpacing: "0.1em",
                    color: "rgba(244,234,217,0.45)",
                    zIndex: 2,
                    textTransform: "lowercase",
                  }}
                >
                  {cell.label}
                </span>
              )}
              {cell.selected && (
                <div
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--plum)",
                    border: "2px solid #120E17",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 3,
                    color: "var(--cream)",
                    fontSize: 8,
                  }}
                >
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Bottom bar */}
      <div
        style={{
          padding: "10px 14px 14px",
          background: "rgba(12,10,15,0.95)",
          borderTop: "1px solid rgba(244,234,217,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--cream-4, #6E6758)",
              letterSpacing: "0.12em",
            }}
          >
            {t.photoPickerPhotosSelectedTemplate.replace("{count}", "6")}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              color: "var(--plum-2, #A584A6)",
              letterSpacing: "0.1em",
            }}
          >
            {t.photoPickerClear}
          </span>
        </div>
        <div
          style={{
            background: "var(--plum)",
            borderRadius: 999,
            padding: 10,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--cream)",
          }}
        >
          {t.photoPickerUploadTemplate.replace("{count}", "6")}
        </div>
      </div>
    </div>
  );
}

// ── Screen 5: Photo Detail ──────────────────────────────────────────────────
export function PhotoDetailScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const g = PH_GRADS.amber;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
        position: "relative",
      }}
    >
      {/* Status bar overlaid */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 5,
          padding: "12px 16px 4px",
          fontSize: "8.5px",
          fontWeight: 600,
          color: "var(--cream)",
        }}
      >
        9:41
      </div>
      {/* Full photo */}
      <div
        aria-hidden
        style={{
          flex: 1,
          background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
          position: "relative",
        }}
      >
        {/* Film grain overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(0,0,0,0.4) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Top gradient for controls */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: "linear-gradient(to bottom, rgba(12,10,15,0.7), transparent)",
            zIndex: 4,
          }}
        />
        {/* Controls */}
        <div
          style={{
            position: "absolute",
            top: 28,
            left: 14,
            right: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 5,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "rgba(12,10,15,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              <path key="heart" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
              <><polyline key="share1" points="16 6 12 2 8 6"/><line key="share2" x1="12" y1="2" x2="12" y2="15"/></>,
            ].map((icon, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(12,10,15,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--cream)" strokeWidth="2">{icon}</svg>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom overlay */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 14,
            background: "linear-gradient(to top, rgba(12,10,15,0.9) 0%, transparent 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F2C08A, #8C5A25)",
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: "8.5px", color: "var(--cream-3, #B5AB99)" }}>{t.photoDetailUploadedBy}</div>
              <div style={{ fontSize: "9.5px", color: "var(--cream)", fontWeight: 500 }}>Ana Kovač</div>
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 10px",
                borderRadius: 999,
                fontFamily: "var(--font-mono)",
                fontSize: "7.5px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                background: "rgba(139,106,140,0.2)",
                color: "var(--plum-2, #A584A6)",
                border: "1px solid rgba(139,106,140,0.3)",
              }}
            >
              {t.photoDetailStarred}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[t.photoDetailHide, t.photoDetailDownload, t.photoDetailApprove].map((label, i) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  padding: 7,
                  borderRadius: 8,
                  border: i < 2 ? "1px solid rgba(244,234,217,0.14)" : "none",
                  background: i === 2 ? "var(--plum)" : "rgba(244,234,217,0.06)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 7,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: i === 2 ? "var(--cream)" : "var(--cream-3, #B5AB99)",
                  textAlign: "center",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 7: Guest List ────────────────────────────────────────────────────
export function GuestListScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const guests = [
    { name: "Ana Kovač",     count: "24 photos · 2 videos", colors: ["amber", "rose"] },
    { name: "Toni Marković", count: "18 photos · 1 video",  colors: ["plum", "ink"] },
    { name: "Lena Petrović", count: "12 photos",            colors: ["gold"] },
    { name: "Marko Đurić",   count: "9 photos",             colors: [] },
    { name: t.guestListAnonymousGuest, count: "6 photos", colors: [], anon: true },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--cream)",
                lineHeight: 1.1,
              }}
            >
              {t.guestListTitle}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                color: "var(--cream-4, #6E6758)",
                marginTop: 2,
                letterSpacing: "0.08em",
              }}
            >
              {t.guestListMeta}
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: 999,
              fontFamily: "var(--font-mono)",
              fontSize: "7.5px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(139,106,140,0.2)",
              color: "var(--plum-2, #A584A6)",
              border: "1px solid rgba(139,106,140,0.3)",
              marginTop: 4,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--plum-2, #A584A6)",
                boxShadow: "0 0 6px var(--plum-2, #A584A6)",
              }}
              className="live-dot"
            />
            {t.guestListLive}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {guests.map((g, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderBottom: "1px solid rgba(244,234,217,0.08)",
              opacity: g.anon ? 0.55 : 1,
            }}
          >
            {g.anon ? (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "rgba(244,234,217,0.08)",
                  border: "1px solid rgba(244,234,217,0.14)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 8,
                  color: "var(--cream-4, #6E6758)",
                  flexShrink: 0,
                }}
              >
                ?
              </div>
            ) : (
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${i === 0 ? "#F2C08A, #8C5A25" : i === 2 ? "#C08B8E, #8B5A5E" : "var(--plum-2, #A584A6), var(--plum, #8B6A8C)"})`,
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: g.anon ? 9 : 10,
                  color: g.anon ? "var(--cream-4, #6E6758)" : "var(--cream-2, #E8DCC6)",
                  marginBottom: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {g.name}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 7.5,
                  color: "var(--cream-4, #6E6758)",
                  letterSpacing: "0.08em",
                }}
              >
                {g.count}
              </div>
            </div>
            {g.colors.length > 0 && (
              <div style={{ display: "flex", gap: 2 }}>
                {g.colors.map((c) => {
                  const gr = PH_GRADS[c] ?? { a: "#3a2f32", b: "#1a1218" };
                  return (
                    <div
                      key={c}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${gr.a}, ${gr.b})`,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Screen 8: Moderation Queue ──────────────────────────────────────────────
export function ModerationScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  const items = [
    { color: "rose", name: "Ana Kovač",     time: t.moderationMinutesAgoTemplate.replace("{count}", "3"),  file: "IMG_4891.HEIC · 4.2 MB" },
    { color: "sage", name: "Toni Marković", time: t.moderationMinutesAgoTemplate.replace("{count}", "8"),  file: "IMG_4892.HEIC · 5.8 MB" },
    { color: "gold", name: t.moderationAnonymous, time: t.moderationMinutesAgoTemplate.replace("{count}", "14"), file: "IMG_4893.HEIC · 3.1 MB" },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 16,
                fontWeight: 400,
                color: "var(--cream)",
              }}
            >
              {t.moderationTitle}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 7.5,
                color: "var(--cream-4, #6E6758)",
                marginTop: 2,
                letterSpacing: "0.08em",
              }}
            >
              {t.moderationPendingApprovalTemplate.replace("{count}", "3")}
            </div>
          </div>
          <div
            style={{
              display: "inline-flex",
              padding: "4px 10px",
              borderRadius: 999,
              fontFamily: "var(--font-mono)",
              fontSize: "7.5px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              background: "rgba(230,167,96,0.15)",
              color: "var(--amber, #E6A760)",
              border: "1px solid rgba(230,167,96,0.25)",
              marginTop: 4,
            }}
          >
            {t.moderationNewTemplate.replace("{count}", "3")}
          </div>
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        {items.map((item, i) => {
          const g = PH_GRADS[item.color] ?? { a: "#3a2f32", b: "#1a1218" };
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                padding: "8px 14px",
                borderBottom: "1px solid rgba(244,234,217,0.08)",
                alignItems: "center",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 6,
                  background: `linear-gradient(135deg, ${g.a}, ${g.b})`,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--cream-2, #E8DCC6)",
                    marginBottom: 2,
                  }}
                >
                  {item.name} · {item.time}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 7,
                    color: "var(--cream-4, #6E6758)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {item.file}
                </div>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid rgba(244,234,217,0.14)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(244,234,217,0.04)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--cream-3, #B5AB99)" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    border: "1px solid rgba(139,106,140,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(139,106,140,0.2)",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--plum-2, #A584A6)" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
        <div style={{ padding: "14px", display: "flex", gap: 8 }}>
          <div
            style={{
              flex: 1,
              padding: 9,
              borderRadius: 999,
              border: "1px solid rgba(244,234,217,0.14)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "0.12em",
              color: "var(--cream-3, #B5AB99)",
              textTransform: "uppercase",
            }}
          >
            {t.moderationRejectAll}
          </div>
          <div
            style={{
              flex: 1,
              padding: 9,
              borderRadius: 999,
              background: "var(--plum)",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 8,
              letterSpacing: "0.12em",
              color: "var(--cream)",
              textTransform: "uppercase",
            }}
          >
            {t.moderationApproveAll}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Screen 9: Share & QR ────────────────────────────────────────────────────
export function ShareQRScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--cream)",
            lineHeight: 1.1,
          }}
        >
          {t.shareTitle}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            marginTop: 2,
            letterSpacing: "0.08em",
          }}
        >
          {t.shareMeta}
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 14,
          gap: 14,
        }}
      >
        {/* QR code */}
        <div
          style={{
            width: 100,
            height: 100,
            background: "var(--cream, #F4EAD9)",
            borderRadius: 12,
            padding: 8,
            boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
          }}
        >
          <svg viewBox="0 0 29 29" width="100%" height="100%" shapeRendering="crispEdges">
            <rect width="29" height="29" fill="#F4EAD9" />
            <g fill="#0C0A0F">
              <rect x="0" y="0" width="7" height="7" /><rect x="1" y="1" width="5" height="5" fill="#F4EAD9" /><rect x="2" y="2" width="3" height="3" />
              <rect x="22" y="0" width="7" height="7" /><rect x="23" y="1" width="5" height="5" fill="#F4EAD9" /><rect x="24" y="2" width="3" height="3" />
              <rect x="0" y="22" width="7" height="7" /><rect x="1" y="23" width="5" height="5" fill="#F4EAD9" /><rect x="2" y="24" width="3" height="3" />
              <rect x="9" y="1" width="1" height="1" /><rect x="11" y="1" width="1" height="1" /><rect x="13" y="2" width="2" height="1" /><rect x="17" y="1" width="1" height="2" />
              <rect x="9" y="4" width="2" height="1" /><rect x="12" y="4" width="1" height="2" /><rect x="15" y="4" width="1" height="1" /><rect x="18" y="4" width="2" height="1" />
              <rect x="8" y="8" width="1" height="1" /><rect x="10" y="8" width="2" height="1" /><rect x="14" y="8" width="1" height="2" /><rect x="17" y="8" width="1" height="1" />
              <rect x="8" y="11" width="1" height="2" /><rect x="11" y="11" width="2" height="1" /><rect x="14" y="11" width="1" height="1" /><rect x="16" y="12" width="2" height="1" />
              <rect x="9" y="14" width="1" height="1" /><rect x="11" y="15" width="2" height="1" /><rect x="14" y="14" width="1" height="2" /><rect x="17" y="14" width="2" height="1" />
              <rect x="8" y="17" width="2" height="1" /><rect x="11" y="17" width="1" height="2" /><rect x="13" y="18" width="1" height="1" /><rect x="15" y="17" width="2" height="1" />
              <rect x="8" y="21" width="1" height="1" /><rect x="10" y="21" width="1" height="1" /><rect x="12" y="20" width="2" height="2" /><rect x="15" y="21" width="1" height="1" />
              <rect x="9" y="24" width="2" height="1" /><rect x="13" y="24" width="1" height="2" /><rect x="15" y="25" width="2" height="1" />
            </g>
          </svg>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "var(--plum-2, #A584A6)",
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          calisto.co/maya-luka-2026
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-mono)",
            fontSize: "7.5px",
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          <span
            className="live-dot"
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--plum-2, #A584A6)",
              boxShadow: "0 0 6px var(--plum-2, #A584A6)",
            }}
          />
          {t.shareAlbumLive} · {t.shareUploadsOpen}
        </div>
        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(244,234,217,0.08)" }} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 7.5,
              color: "var(--cream-4, #6E6758)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            {t.shareOrVia}
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(244,234,217,0.08)" }} />
        </div>
        {/* Share buttons */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          {[t.shareMessage, "WhatsApp", t.shareEmail, t.shareCopyLink].map((label) => (
            <div
              key={label}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 10,
                border: "1px solid rgba(244,234,217,0.14)",
                background: "rgba(244,234,217,0.04)",
                fontFamily: "var(--font-mono)",
                fontSize: 6.5,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--cream-3, #B5AB99)",
                textAlign: "center",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.1em",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          {t.shareNoAppNoAccountOriginals}
        </div>
      </div>
    </div>
  );
}

// ── Screen 10: Download & Export ────────────────────────────────────────────
export function DownloadScreen({ copy }: ScreenProps) {
  const t = getPreviewText(copy);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "#120E17",
      }}
    >
      <StatusBar />
      <div style={{ padding: "10px 14px 8px", flexShrink: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            fontWeight: 400,
            color: "var(--cream)",
            lineHeight: 1.1,
          }}
        >
          {t.downloadTitle}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            marginTop: 2,
            letterSpacing: "0.08em",
          }}
        >
          {t.downloadMetaOriginals}
        </div>
      </div>
      <div style={{ height: 1, background: "rgba(244,234,217,0.08)", flexShrink: 0 }} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          gap: 14,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(139,106,140,0.15)",
            border: "1px solid rgba(139,106,140,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 30px rgba(139,106,140,0.15)",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--plum-2, #A584A6)" strokeWidth="1.6">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 16,
            color: "var(--cream)",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {t.downloadMemoriesLine1}<br />{t.downloadMemoriesLine2}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7.5,
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.8,
          }}
        >
          247 photos · 16 videos<br />
          {t.downloadOriginalQuality}
        </div>
        {/* Options */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { label: t.downloadAllPhotosVideos, right: "14.2 GB" },
            { label: t.downloadPhotosOnly, right: "11.4 GB" },
            { label: t.downloadStarredOnly, right: "2.1 GB" },
          ].map((opt) => (
            <div
              key={opt.label}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 12px",
                background: "rgba(244,234,217,0.04)",
                border: "1px solid rgba(244,234,217,0.08)",
                borderRadius: 10,
                fontSize: 9,
                color: "var(--cream-2, #E8DCC6)",
              }}
            >
              <span>{opt.label}</span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 7.5,
                  color: "var(--plum-2, #A584A6)",
                  letterSpacing: "0.08em",
                }}
              >
                {opt.right}
              </span>
            </div>
          ))}
        </div>
        <div
          style={{
            width: "100%",
            background: "var(--plum)",
            borderRadius: 999,
            padding: 11,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 500,
            color: "var(--cream)",
          }}
        >
          {t.downloadPrepare}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 7,
            color: "var(--cream-4, #6E6758)",
            letterSpacing: "0.1em",
            textAlign: "center",
          }}
        >
          {t.downloadReadyInMinutes} · {t.downloadLinkByEmail}
        </div>
      </div>
    </div>
  );
}
