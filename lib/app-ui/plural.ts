export type PluralForms = Readonly<{ one: string; few: string; other: string }>;

/** Pick the plural form for `count` ("few" is the Croatian 2–4 form) and fill in `{count}`, locale-formatted. */
export function plural(locale: string, count: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(locale).select(count);
  const template = category === "one" ? forms.one : category === "few" ? forms.few : forms.other;
  return template.split("{count}").join(count.toLocaleString(locale));
}
