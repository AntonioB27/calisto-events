export type PlanId = "free" | "standard" | "premium" | "max";

export type PlanRow = {
  label: string;
  value: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  rows: PlanRow[];
};

export const PLAN_ORDER: PlanId[] = ["free", "standard", "premium", "max"];

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    rows: [
      { label: "Price", value: "0€" },
      { label: "Storage", value: "1 GB" },
      { label: "Photos", value: "Yes" },
      { label: "Videos", value: "No" },
      { label: "Retention", value: "1 month after event date" },
      { label: "Guest limit", value: "50" },
      { label: "ZIP export", value: "No" },
    ],
  },
  {
    id: "standard",
    name: "Standard",
    rows: [
      { label: "Price", value: "15€" },
      { label: "Storage", value: "5 GB" },
      { label: "Photos", value: "Yes" },
      { label: "Videos", value: "Up to 20 videos, max 30 sec each" },
      { label: "Retention", value: "3 months after event date" },
      { label: "Guest limit", value: "150" },
      { label: "ZIP export", value: "Organizers only, from 24 h after event date" },
    ],
  },
  {
    id: "premium",
    name: "Premium",
    rows: [
      { label: "Price", value: "25€" },
      { label: "Storage", value: "20 GB" },
      { label: "Photos", value: "Yes" },
      { label: "Videos", value: "Up to 100 videos, max 60 sec each" },
      { label: "Retention", value: "6 months after event date" },
      { label: "Guest limit", value: "350" },
      { label: "ZIP export", value: "Organizers only, from 24 h after event date" },
    ],
  },
  {
    id: "max",
    name: "Max",
    rows: [
      { label: "Price", value: "50€" },
      { label: "Storage", value: "100 GB" },
      { label: "Photos", value: "Yes" },
      { label: "Videos", value: "Unlimited videos, max 180 sec each" },
      { label: "Retention", value: "12 months after event date" },
      { label: "Guest limit", value: "800" },
      { label: "ZIP export", value: "Organizers only, from 24 h after event + full archive" },
    ],
  },
];

export const PLAN_FOOTNOTE =
  "Fair-use policy applies: a reasonable maximum file size per video is enforced to prevent abuse. Uploads that exceed the per-file size limit will be rejected with a clear error message.";
