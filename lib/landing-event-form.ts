export function buildPlanStartUrl(
  name: string,
  date: string,
  emoji: string,
  planId: string,
): string {
  const params = new URLSearchParams({ step: "3", name, date, planId });
  if (emoji) params.set("emoji", emoji);
  return `/events/new?${params.toString()}`;
}
