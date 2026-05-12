import { redirect } from "next/navigation";
import { getUiLocale } from "@/lib/ui-locale";

export default async function Home() {
  const locale = await getUiLocale();
  redirect(`/${locale}`);
}
