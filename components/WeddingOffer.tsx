"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LandingCopy, Locale } from "@/lib/i18n";
import type { StartPageCopy } from "@/lib/i18n-start";
import { formatEuroCents, getFoundingEventsPlanPrice } from "@/lib/founding-events-promotion";
import { buildPlanStartUrl } from "@/lib/landing-event-form";
import styles from "./WeddingOffer.module.css";

const messages = {
  hr: { invitation: "Pozivnica za vaše najljepše uspomene", title: "Veliki dan. Sve uspomene.", flourish: "Pola cijene.", choose: "Odaberite svoj paket", included: "U vašem paketu", next: "Nastavi", details: "Recite nam nešto o vašem danu", back: "Promijeni paket", free: "Želim prvo probati besplatno", once: "Jednokratno, po događaju", checkout: "Nastavi na plaćanje", reassurance: "Popust se primjenjuje automatski. Prijava i sigurno plaćanje slijede u sljedećem koraku.", memories: "Jedan album, iz svakog kuta vašeg dana.", demo: "Pogledajte kako izgleda album" },
  en: { invitation: "An invitation to your favourite memories", title: "Your big day. Every memory.", flourish: "Half the price.", choose: "Choose your package", included: "Your package includes", next: "Continue", details: "Tell us about your day", back: "Change package", free: "I'd like to try it for free first", once: "One payment, per event", checkout: "Continue to payment", reassurance: "Your discount is applied automatically. Sign-in and secure payment follow in the next step.", memories: "One album, every angle of your day.", demo: "See what the album looks like" },
  de: { invitation: "Eine Einladung zu euren schönsten Erinnerungen", title: "Euer großer Tag. Jede Erinnerung.", flourish: "Zum halben Preis.", choose: "Wählt euer Paket", included: "In eurem Paket enthalten", next: "Weiter", details: "Erzählt uns von eurem Tag", back: "Paket ändern", free: "Ich möchte es zuerst kostenlos testen", once: "Einmalige Zahlung pro Event", checkout: "Weiter zur Zahlung", reassurance: "Der Rabatt wird automatisch angewendet. Anmeldung und sichere Zahlung folgen im nächsten Schritt.", memories: "Ein Album, jeder Blickwinkel eures Tages.", demo: "So sieht das Album aus" },
};

export function WeddingOffer({ locale, copy, formCopy }: { locale: Locale; copy: LandingCopy; formCopy: StartPageCopy }) {
  const router = useRouter();
  const t = messages[locale];
  const plans = copy.plans.filter(p => p.id !== "free");
  const [selected, setSelected] = useState("plus");
  const [details, setDetails] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const plan = plans.find(p => p.id === selected)!;
  const price = getFoundingEventsPlanPrice(selected);
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Calisto"><Link href={`/${locale}`}>Calisto.</Link><span>{copy.launchOffer.label}</span></nav>
      <div className={styles.invitation}>
        <header className={styles.header}>
          <span className={styles.seal}>−50%</span>
          <p className={styles.eyebrow}>{t.invitation}</p>
          <h1>{t.title}<em>{t.flourish}</em></h1>
          <p className={styles.deadline}>{copy.launchOffer.timing}</p>
        </header>
        {!details ? <section aria-labelledby="offer-packages">
          <h2 id="offer-packages">{t.choose}</h2>
          <div className={styles.plans}>
            {plans.map(p => { const amount = getFoundingEventsPlanPrice(p.id); return <button key={p.id} type="button" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)} className={styles.plan}>
              <span className={styles.planName}>{p.name}<span aria-hidden>{selected === p.id ? "✓" : ""}</span></span>
              <span className={styles.price}><s>{formatEuroCents(amount.listAmountEuroCents)}</s><strong>{formatEuroCents(amount.amountEuroCents)}</strong></span>
              <span className={styles.capacity}>{p.rows[3]?.value} · {p.rows[3]?.label}</span>
            </button>; })}
          </div>
          <p className={styles.once}>{t.once}</p>
          <div className={styles.included} aria-live="polite"><h3>{plan.name} — {t.included}</h3><dl>{plan.rows.slice(1).map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></div>
          <Link className={styles.free} href={`/${locale}/start`}>{t.free}</Link>
          <div className={styles.memory}><Image src="/brand/mascot/aurora_camera.png" alt={copy.auroraMascotAlt} width={76} height={76}/><h2>{t.memories}</h2><p>{copy.heroSignals.join(" · ")}</p><Link href="/demo">{t.demo} →</Link></div>
        </section> : <section aria-labelledby="offer-details">
          <button className={styles.back} onClick={() => setDetails(false)} type="button">← {t.back}</button>
          <h2 id="offer-details">{t.details}</h2>
          <form id="offer-form" className={styles.form} onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const eventName = String(data.get("name") ?? "").trim(); const eventDate = String(data.get("date") ?? ""); if (!eventName || !eventDate) return; router.push(buildPlanStartUrl(eventName, eventDate, "💍", selected)); }}>
            <label>{formCopy.formNameLabel}<input name="name" required maxLength={160} value={name} onChange={e => setName(e.target.value)} placeholder={formCopy.formNamePlaceholder}/></label>
            <label>{formCopy.formDateLabel}<input name="date" required type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
            <p>{t.reassurance}</p>
          </form>
        </section>}
      </div>
      <div className={styles.bottom}><div><span>{plan.name}</span><strong>{formatEuroCents(price.amountEuroCents)}</strong></div>{details ? <button key="payment" type="submit" form="offer-form">{t.checkout} →</button> : <button key="details" type="button" onClick={() => { setDetails(true); window.scrollTo({ top: 0, behavior: "instant" }); }}>{t.next} →</button>}</div>
    </main>
  );
}
