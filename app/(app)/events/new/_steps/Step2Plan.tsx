import type { PlanId } from "@/lib/plan-limits";
import { GoldBar } from "@/components/app-ui/GoldBar";

type Step2PlanProps = {
  name: string;
  date: string;
  selectedPlanId: PlanId;
  planOptions: readonly PlanId[];
  validationError: "NAME_REQUIRED" | null;
};

const PLAN_META: Record<string, { sub: string; price: string; grad: string; shadowColor: string }> = {
  free:     { sub: 'Up to 5 guests',   price: 'Free',        grad: 'linear-gradient(135deg,#9CA3AF,#6B7280)', shadowColor: '#9CA3AF' },
  standard: { sub: 'Up to 20 guests',  price: '€9 / event',  grad: 'linear-gradient(135deg,#60A5FA,#2563EB)', shadowColor: '#2563EB' },
  plus:     { sub: 'Up to 40 guests',  price: '€14 / event', grad: 'linear-gradient(135deg,#34D399,#059669)', shadowColor: '#059669' },
  premium:  { sub: 'Up to 70 guests',  price: '€19 / event', grad: 'linear-gradient(135deg,#F87171,#DC2626)', shadowColor: '#DC2626' },
  max:      { sub: 'Unlimited guests', price: '€35 / event', grad: 'linear-gradient(135deg,#F0C060,#C5922A)', shadowColor: '#C5922A' },
};

export function Step2Plan({ name, date, selectedPlanId, planOptions, validationError }: Step2PlanProps) {
  return (
    <div style={{ padding: '40px 0 60px' }}>
      <GoldBar />
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)', marginTop: 10, marginBottom: 6 }}>
        Choose a Plan
      </h1>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginBottom: 32 }}>
        Select the plan that fits your event size.
      </p>

      <form action="/events/new" method="get">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="date" value={date} />

        {validationError && (
          <p style={{ marginBottom: 16, fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
            Event name is required. Please go back and enter a name.
          </p>
        )}

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 28, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {planOptions.map(planId => {
              const sel = selectedPlanId === planId;
              const meta = PLAN_META[planId] ?? { sub: '', price: '', grad: 'transparent', shadowColor: 'transparent' };
              return (
                <label key={planId} style={{ cursor: 'pointer' }}>
                  <input type="radio" name="planId" value={planId} defaultChecked={sel} style={{ display: 'none' }} />
                  <div style={{
                    padding: '16px 18px', borderRadius: 14, textAlign: 'left', transition: 'all 0.18s',
                    background: sel ? meta.grad : 'var(--app-bg)',
                    boxShadow: sel ? `0 4px 16px ${meta.shadowColor}44` : 'none',
                    transform: sel ? 'scale(1.02)' : 'scale(1)',
                    outline: sel ? 'none' : `1.5px solid var(--app-border)`,
                    cursor: 'pointer',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: sel ? '#fff' : 'var(--app-text)', textTransform: 'capitalize' }}>
                      {planId}
                    </div>
                    <div style={{ fontSize: 11, color: sel ? 'rgba(255,255,255,0.8)' : 'var(--app-muted)', marginTop: 3, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                      {meta.sub}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: sel ? 'rgba(255,255,255,0.9)' : meta.shadowColor, marginTop: 6 }}>
                      {meta.price}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="submit" formAction="/events/new" formMethod="get" name="step" value="1"
            style={{
              flex: '0 0 auto', padding: '15px 24px', borderRadius: 14,
              border: '1.5px solid var(--app-border)', background: 'transparent',
              color: 'var(--app-muted)', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            ← Back
          </button>
          <button
            type="submit" name="step" value="3"
            style={{
              flex: 1, padding: '15px', border: 'none', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Continue to payment →
          </button>
        </div>
      </form>
    </div>
  );
}
