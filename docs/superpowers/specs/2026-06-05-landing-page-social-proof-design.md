# Landing Page: Social Proof Stat Bar + Simplified Plan Labels

**Date:** 2026-06-05
**Scope:** Two focused changes to improve conversion on the landing page.

---

## 1. StatBar — Social Proof Section

**What:** Render the existing `StatBar` component between `<Hero>` and `<AppPreviewWindow>` in `app/[locale]/page.tsx`.

**Change in page layout:**
```
<Hero>
<StatBar>   ← add here
<AppPreviewWindow>
...
```

**New statBar copy (English):**
| value | label |
|---|---|
| 436 weddings | already celebrated |
| 9,000+ photos | captured and shared |
| 5,000+ guests | no app, no account |

**Croatian (hr):**
| value | label |
|---|---|
| 436 vjenčanja | već proslavljena |
| 9.000+ fotografija | snimljeno i podijeljeno |
| 5.000+ gostiju | bez aplikacije i računa |

**German (de):**
| value | label |
|---|---|
| 436 Hochzeiten | bereits gefeiert |
| 9.000+ Fotos | aufgenommen und geteilt |
| 5.000+ Gäste | ohne App, ohne Konto |

---

## 2. Plan Row Label Renames

Applies to all 5 plans (free, standard, plus, premium, max) in all 3 locales.

**English:**
| Old label | New label |
|---|---|
| ZIP export | Download all |
| Upload window | Guests can upload for |
| Event deletion | Photos kept for |

**Croatian (hr):**
| Old label | New label |
|---|---|
| ZIP izvoz | Preuzmi sve |
| Rok uploada | Gosti mogu učitavati još |
| Brisanje događaja | Fotografije čuvamo |

**German (de):**
| Old label | New label |
|---|---|
| ZIP-Export | Alles herunterladen |
| Upload-Fenster | Gäste können hochladen für |
| Event-Löschung | Fotos gespeichert für |

---

## Files Changed

- `app/[locale]/page.tsx` — import and render `<StatBar>` after `<Hero>`
- `lib/i18n.ts` — update `statBar` copy and plan row labels in all 3 locales
