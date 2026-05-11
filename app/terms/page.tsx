import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/i18n";

export default function TermsRedirectPage() {
  redirect(`/${DEFAULT_LOCALE}/terms`);
}
