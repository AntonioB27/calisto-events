import { redirect } from "next/navigation";

type RegisterRedirectPageProps = {
  searchParams?: Promise<{ returnTo?: string | string[] }>;
};

/** Back-compat: old links go to the combined auth page on `/auth/login`. */
export default async function RegisterRedirectPage(props: RegisterRedirectPageProps) {
  const sp = await props.searchParams;
  const raw = sp?.returnTo;
  const returnTo = Array.isArray(raw) ? raw[0] : raw;
  const qs = new URLSearchParams();
  qs.set("mode", "register");
  if (returnTo && typeof returnTo === "string" && returnTo.trim()) {
    qs.set("returnTo", returnTo.trim());
  }
  redirect(`/auth/login?${qs.toString()}`);
}
